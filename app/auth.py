# app2/auth.py
import streamlit as st
import time

def authenticate():
    """
    Simple session-state based authentication.
    """
    if "authenticated" not in st.session_state:
        st.session_state.authenticated = False

    if st.session_state.authenticated:
        return True

    st.markdown("## 🔒 User Login")
    
    with st.form("login_form"):
        username = st.text_input("Username")
        password = st.text_input("Password", type="password")
        submit = st.form_submit_button("Login")
        
        if submit:
            if username == "admin" and password == "admin":
                st.session_state.authenticated = True
                st.success("Login successful!")
                time.sleep(1)
                st.rerun()
            else:
                st.error("Invalid username or password (admin/admin)")
                
    return False

def logout():
    st.session_state.authenticated = False
    st.rerun()
