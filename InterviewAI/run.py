#!/usr/bin/env python3
"""
Run script for Interview AI application
"""
import os
import sys
import subprocess

def check_requirements():
    """Check if all requirements are installed"""
    try:
        import streamlit
        import google.generativeai
        import PyPDF2
        import docx
        import pandas
        import plotly
        import fpdf
        print("✅ All requirements are installed")
        return True
    except ImportError as e:
        print(f"❌ Missing requirement: {e}")
        print("Please run: pip install -r requirements.txt")
        return False

def check_api_key():
    """Check if API key is set"""
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("⚠️  GEMINI_API_KEY not found in environment variables")
        print("Please set your API key:")
        print("1. Create a .env file in the InterviewAI directory")
        print("2. Add: GEMINI_API_KEY=your_api_key_here")
        print("3. Or set it as an environment variable")
        return False
    print("✅ API key found")
    return True

def main():
    """Main function to run the application"""
    print("🚀 Starting Interview AI Application...")
    
    # Check requirements
    if not check_requirements():
        sys.exit(1)
    
    # Check API key
    if not check_api_key():
        print("\nYou can still run the app, but question generation and evaluation won't work.")
        response = input("Continue anyway? (y/n): ")
        if response.lower() != 'y':
            sys.exit(1)
    
    # Run Streamlit app
    try:
        print("\n🌐 Starting Streamlit server...")
        print("The app will open in your default browser")
        print("Press Ctrl+C to stop the server")
        
        subprocess.run([
            sys.executable, "-m", "streamlit", "run", "app.py",
            "--server.port", "8501",
            "--server.address", "localhost"
        ])
    except KeyboardInterrupt:
        print("\n👋 Application stopped by user")
    except Exception as e:
        print(f"❌ Error running application: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
