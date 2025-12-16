import Mailgun from "mailgun.js"
import formData from "form-data"

const mailgun = new Mailgun(formData)

// Only initialize if API key is available
export const mg = process.env.MAILGUN_API_KEY
  ? mailgun.client({
      username: "api",
      key: process.env.MAILGUN_API_KEY,
    })
  : null
