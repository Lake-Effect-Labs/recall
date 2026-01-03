# How Twilio Integration Works

## ⚠️ Important: You Need a Twilio Phone Number

**You cannot use your regular phone number directly.** The Recall app requires a Twilio phone number to work because:

1. **Webhooks**: Twilio sends webhooks to your app when calls come in. Regular phone carriers don't do this.
2. **Call Recording**: Twilio provides the infrastructure to automatically record calls.
3. **Call Metadata**: Twilio provides call details (duration, direction, etc.) that your app needs.

## How It Works

### Current Flow

1. **You get a Twilio phone number** (e.g., +1-555-123-4567)
2. **Configure webhook** in Twilio to point to: `https://your-domain.com/api/twilio/voice`
3. **Someone calls your Twilio number** → Twilio sends webhook to your app
4. **Your app**:
   - Identifies your account by matching the "To" number
   - Creates/updates customer record
   - Records the call
   - Transcribes and extracts insights

### The Problem with Regular Phone Numbers

Regular phone carriers (Verizon, AT&T, etc.) don't:
- Send webhooks to your app
- Provide call recording APIs
- Give you programmatic access to call data

**This is why you need Twilio** - it's the bridge between phone calls and your app.

## Solutions: Using Your Existing Number

### Option 1: Call Forwarding (Recommended) ✅

**Forward your regular number to your Twilio number:**

1. Get a Twilio phone number
2. Set up call forwarding from your regular carrier:
   - **Verizon**: Call *72 + Twilio number
   - **AT&T**: Call *21* + Twilio number + #
   - **T-Mobile**: Settings → Call Forwarding → Forward to Twilio number
   - **Other carriers**: Check their call forwarding instructions

3. When someone calls your regular number:
   - Call forwards to Twilio number
   - Twilio sends webhook to your app
   - Everything works automatically!

**Pros:**
- Keep your existing phone number
- Works with any carrier
- No changes needed to your app

**Cons:**
- You need to answer on the Twilio number (or set up more forwarding)
- May have slight delay

### Option 2: Port Your Number to Twilio

You can port (transfer) your existing phone number to Twilio:

1. Contact Twilio support to port your number
2. Takes 1-2 weeks typically
3. Your number becomes a Twilio number
4. Works exactly like a new Twilio number

**Pros:**
- Keep your existing number
- Full control over the number

**Cons:**
- Takes time to port
- May have downtime during transfer
- May cost a porting fee

### Option 3: Use Twilio for Outbound, Regular Phone for Inbound

**Not recommended** - This breaks the automation because:
- Inbound calls to your regular number won't create customers automatically
- You'd have to manually enter calls
- Defeats the purpose of the app

## Cost Considerations

**Twilio pricing (approximate):**
- Phone number: ~$1/month
- Inbound calls: ~$0.0085/minute
- Call recording: ~$0.0025/minute
- Storage: ~$0.001/recording-minute

**Example:** 100 calls/month, 5 minutes each = ~$5-10/month

## Setup Steps

1. **Sign up for Twilio**: https://twilio.com
2. **Get a phone number**:
   - Console → Phone Numbers → Buy a Number
   - Choose a number with Voice capabilities
3. **Configure webhook**:
   - Click on your number
   - Set "A CALL COMES IN" webhook to: `https://your-domain.com/api/twilio/voice`
   - Method: POST
4. **Add credentials to Recall**:
   - Go to Settings in Recall
   - Enter Account SID, Auth Token, and Phone Number

## Testing Locally

For local development, use ngrok:

```bash
ngrok http 3000
```

Then set your Twilio webhook to: `https://your-ngrok-id.ngrok.io/api/twilio/voice`

## FAQ

**Q: Can I use my iPhone/Android number?**  
A: Not directly. You need to forward calls to a Twilio number or port your number to Twilio.

**Q: Will customers see my Twilio number?**  
A: If you forward calls, they'll see your regular number. If you port, they'll see the same number.

**Q: Can I make outbound calls through Twilio?**  
A: Yes! Twilio supports outbound calls. The app currently handles both inbound and outbound.

**Q: What if I don't want to use Twilio?**  
A: You'd need to manually enter calls, which defeats the automation. The app is designed around Twilio's webhook system.

## Need Help?

- Twilio Support: https://support.twilio.com
- Twilio Docs: https://www.twilio.com/docs
- Recall GitHub Issues: (if you have the repo)

