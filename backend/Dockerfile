FROM docker.io/python:3-alpine

WORKDIR /app

COPY requirements.txt . 
RUN apk add g++
RUN pip install -r requirements.txt

COPY main.py .
COPY modules modules

ENTRYPOINT ["python" ,"main.py"]
