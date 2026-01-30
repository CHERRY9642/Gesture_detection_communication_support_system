# app2/app.py
import streamlit as st
import pandas as pd
import numpy as np
import altair as alt
import cv2
from PIL import Image

# Import helper modules
from auth import authenticate, logout
from data_simulator import generate_mock_logs, forecast_usage
from predictor import GesturePredictor
from utils import convert_df_to_csv, apply_style

# 1. Page Config (Must be first)
st.set_page_config(page_title="SLR Business Dashboard", layout="wide", page_icon="✋")

# 2. Authentication
if not authenticate():
    st.stop()

# 3. Sidebar & Settings
st.sidebar.title("Navigation")
page = st.sidebar.radio("Go to", ["Dashboard", "Live Prediction", "System Health", "Logs"])

# Load Data (Simulation)
@st.cache_data
def get_data():
    return generate_mock_logs()

df_logs = get_data()

# 4. Main Content
apply_style()

st.title("Admin Dashboard - Sign Language Recognition")
st.markdown("---")

if page == "Dashboard":
    # --- KPI Section ---
    col1, col2, col3, col4 = st.columns(4)
    with col1:
        st.metric("Total Predictions", len(df_logs))
    with col2:
        avg_conf = df_logs["Confidence"].mean() * 100
        st.metric("Avg Confidence", f"{avg_conf:.1f}%")
    with col3:
        n_users = df_logs["User"].nunique()
        st.metric("Active Users", n_users)
    with col4:
        high_risk = len(df_logs[df_logs["Risk_Status"] == "High"])
        st.metric("High Risk Flags", high_risk, delta=high_risk, delta_color="inverse")

    # --- Charts Row 1 ---
    c1, c2 = st.columns(2)
    with c1:
        st.subheader("Usage Trend (Last 30 Days)")
        chart_data = df_logs.set_index("Timestamp").resample("D").size().reset_index(name="Count")
        chart = alt.Chart(chart_data).mark_area(opacity=0.5, color='teal').encode(
            x='Timestamp', y='Count'
        )
        st.altair_chart(chart, use_container_width=True)
        
    with c2:
        st.subheader("Customer Segmentation (User Activity)")
        user_counts = df_logs['User'].value_counts().reset_index()
        user_counts.columns = ['User', 'Count']
        pie = alt.Chart(user_counts).mark_arc().encode(
            theta=alt.Theta(field="Count", type="quantitative"),
            color=alt.Color(field="User", type="nominal")
        )
        st.altair_chart(pie, use_container_width=True)

    # --- Map Section ---
    st.subheader("User Geographic Distribution")
    map_data = df_logs[['Latitude', 'Longitude']].dropna()
    st.map(map_data)
    
    # --- Forecasting ---
    st.subheader("Traffic Forecast (Next 7 Days)")
    forecast_df = forecast_usage(df_logs)
    
    line = alt.Chart(forecast_df).mark_line(color='orange', point=True).encode(
        x='Timestamp', y='Predicted_Count', tooltip=['Timestamp', 'Predicted_Count']
    )
    st.altair_chart(line, use_container_width=True)


elif page == "Live Prediction":
    st.header("Real-time Inference")
    
    mode = st.radio("Input Source", ["Upload Image", "Camera"])
    predictor = GesturePredictor()
    
    img_input = None
    
    if mode == "Upload Image":
        uploaded_file = st.file_uploader("Choose an image...", type=["jpg", "png"])
        if uploaded_file:
            image = Image.open(uploaded_file)
            st.image(image, caption='Uploaded Image', use_column_width=True)
            img_input = np.array(image.convert('RGB')) # Convert for CV2
            
    elif mode == "Camera":
         img_file_buffer = st.camera_input("Take a picture")
         if img_file_buffer:
             image = Image.open(img_file_buffer)
             img_input = np.array(image.convert('RGB'))

    # Prediction Logic
    if st.button("Predict Gesture") and img_input is not None:
        # Convert RGB to BGR for CV2 logic in predictor
        img_bgr = cv2.cvtColor(img_input, cv2.COLOR_RGB2BGR)
        
        with st.spinner('Analyzing landmarks...'):
            label, conf, feats = predictor.predict(img_bgr)
            
        st.success("Prediction Complete!")
        
        res_col1, res_col2 = st.columns(2)
        with res_col1:
            st.info(f"**Gesture:** {label}")
            st.info(f"**Confidence:** {conf*100:.2f}%")
            
        with res_col2:
            st.write("**Feature Importance (Visual):**")
            feat_df = pd.DataFrame({"Feature": range(len(feats)), "Value": feats})
            st.bar_chart(feat_df.set_index("Feature"))
            
        if conf < 0.7:
             st.warning("⚠️ Low Confidence Alert! This prediction is flagged as High Risk.")

elif page == "System Health":
    st.header("System Status & Alerts")
    
    st.info("System Status: 🟢 OPERATIONAL")
    st.write("Last Maintenance: 2026-01-20")
    
    st.subheader("Alert System Log")
    alerts = df_logs[df_logs["Confidence"] < 0.6]
    if not alerts.empty:
        st.error(f"Found {len(alerts)} predictions with critical low confidence (<60%)")
        st.table(alerts[["Timestamp", "User", "Predicted_Gesture", "Confidence"]].head(5))
    else:
        st.success("No system alerts.")

elif page == "Logs":
    st.header("Detailed Transaction Logs")
    
    # Filters
    users = st.multiselect("Filter by User", df_logs["User"].unique())
    if users:
        df_logs = df_logs[df_logs["User"].isin(users)]
        
    st.dataframe(df_logs)
    
    csv = convert_df_to_csv(df_logs)
    st.download_button(
        "Download Logs as CSV",
        csv,
        "prediction_logs.csv",
        "text/csv",
        key='download-csv'
    )

st.sidebar.markdown("---")
if st.sidebar.button("Logout"):
    logout()
