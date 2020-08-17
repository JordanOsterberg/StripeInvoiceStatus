import * as dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
const app = express();

import bodyParser from "body-parser";

import TextController from './textcontroller';
const textController = new TextController(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_ACCOUNT_AUTH, process.env.TWILIO_PHONE_NUMBER);

app.post("/v1/webhook", bodyParser.raw({type: "application/json"}), async (request: Request, response: Response) => {
    let event;

    try {
        event = JSON.parse(request.body);
    } catch (err) {
        response.status(400).send(`Webhook Error: ${err.message}`);
    }

    switch(event.type) {
        case 'invoice.paid':
            const invoice = event.data.object;

            try {
                await textController.sendText(`💸 Invoice ${invoice.number} for $${invoice.total} was paid.`, process.env.RECEIVER_PHONE_NUMBER || "")
            } catch (err) {
                console.error(err);
            }

            break;
        case 'payout.paid':
            const payout = event.data.object;

            try {
                const arrivalDate = new Date(payout.arrival_date * 1000);
                const dateTimeFormat = new Intl.DateTimeFormat('en', { month: 'long', day: '2-digit' });
                const [{ value: month },,{ value: day }] = dateTimeFormat .formatToParts(arrivalDate);
                const arrivalDateString = `${month} ${day}`

                await textController.sendText(`➡️ A payout for $${payout.amount} is now ${payout.status.replace("_", " ")} and will arrive around ${arrivalDateString}.`, process.env.RECEIVER_PHONE_NUMBER || "")
            } catch (err) {
                console.error(err);
            }

            break;
        default:
            return response.status(400).end();
    }

    response.status(200).json({received: true});
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log("App started on " + port);
})