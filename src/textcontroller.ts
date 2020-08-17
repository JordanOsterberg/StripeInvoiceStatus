import twilio, { Twilio } from 'twilio';

export default class TextController {

    private twilioClient: Twilio
    private senderPhoneNumber?: string;

    constructor($accountSid?: string, $authToken?: string, $senderPhoneNumber?: string) {
        this.twilioClient = twilio($accountSid, $authToken);
        this.senderPhoneNumber = $senderPhoneNumber;
    }

    public sendText(text: string, to: string): Promise<void> {
        return new Promise<void>(async (resolve) => {
            await this.twilioClient.messages.create({ 
               body: text, 
               from: this.senderPhoneNumber,       
               to: to 
            });
            
            resolve();
        });
    }

}