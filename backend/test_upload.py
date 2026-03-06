import requests

url = "http://127.0.0.1:5000/predict"

files = {
    "image": open(r"C:\Users\shibl\Downloads\amd\amd\424_right.jpg", "rb")
}
response = requests.post(url, files=files)

print(response.status_code)
print(response.json())
