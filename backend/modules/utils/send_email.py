# official example
"""
curl -s \
	-X POST \
	--user "$MJ_APIKEY_PUBLIC:$MJ_APIKEY_PRIVATE" \
	https://api.mailjet.com/v3.1/send \
	-H 'Content-Type: application/json' \
	-d '{
		"Messages":[
				{
						"From": {
								"Email": "$SENDER_EMAIL",
								"Name": "Me"
						},
						"To": [
								{
										"Email": "$RECIPIENT_EMAIL",
										"Name": "You"
								}
						],
						"Subject": "My first Mailjet Email!",
						"TextPart": "Greetings from Mailjet!",
						"HTMLPart": "<h3>Dear passenger 1, welcome to <a href=\"https://www.mailjet.com/\">Mailjet</a>!</h3><br />May the delivery force be with you!"
				}
		]
	}'
"""

import requests as r
import os
auth = r.auth.HTTPBasicAuth(os.getenv("MAILJET_API_KEY"), os.getenv("MAILJET_SECRET_KEY"))
EMAIL_ENABLED = auth.username is not None and auth.password is not None
SENDER_EMAIL = "no-reply@stipendify.tk0.eu"
SENDER_NAME = "Stipendify"
def send_email(to, subject, text=None, html=None):
    if not EMAIL_ENABLED:
        return None
    d = {"Messages": [
        {"From": 
           {"Email": SENDER_EMAIL, "Name": SENDER_NAME}, 
         "To": [{"Email": to}],
         "Subject": subject}]}
    if text is not None:
        d["Messages"][0]["TextPart"] = text
    if html is not None:
        d["Messages"][0]["HTMLPart"] = html
    print(d)
    req = r.post("https://api.mailjet.com/v3.1/send", auth=auth, json=d)
    return req.json()

if __name__ == "__main__":
    print(send_email("toni@kukec.dev", "Hello from Stipendify", text=":3"))
