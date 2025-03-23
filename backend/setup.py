from setuptools import setup, find_packages

setup(
    name="backend",
    version="0.1.0",
    packages=find_packages(),
    install_requires=[
        "fastapi==0.115.6",
        "uvicorn==0.25.0",
        "websockets==14.1",
        "openai==1.2.4",
        "python-dotenv==1.0.0",
        "beautifulsoup4==4.12.2",
        "httpx==0.25.1",
        "pre-commit==3.6.2",
        "anthropic==0.49.0",
        "moviepy==1.0.3",
        "pillow==10.3.0",
        "types-pillow==10.2.0.20240520",
        "aiohttp==3.9.5",
        "pydantic==2.10",
        "google-genai==0.3.0",
    ],
) 