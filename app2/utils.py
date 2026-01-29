# app2/utils.py
import pandas as pd
import streamlit as st

def convert_df_to_csv(df):
    """
    Converts DataFrame to CSV for download button.
    """
    return df.to_csv(index=False).encode('utf-8')

def apply_style():
    """
    Specific styling for the dashboard.
    """
    st.markdown("""
        <style>
        .metric-card {
            background-color: #f0f2f6;
            padding: 15px;
            border-radius: 10px;
            text-align: center;
            box-shadow: 2px 2px 5px rgba(0,0,0,0.1);
        }
        .stButton>button {
            width: 100%;
        }
        </style>
    """, unsafe_allow_html=True)
