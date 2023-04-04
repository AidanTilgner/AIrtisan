# Triggers

### What are Triggers?

This feature allows you to interact with Onyx Core via your chatbot. Basically, there might be times when you'd like certain intents of users to trigger actions on your Onyx Core server. Such as when someone wants to contact you directly. If this happens, then you might want an action to be triggered on Onyx Core, such as a notification being dispatched. However, for privacy and security reasons, you might not want any direct action dispatch from the Onyx Chat server. Therefore, you might implement a trigger, which will send a request, as well as necessary arguments, to the Onyx Core server. The Onyx Core server will then handle the action dispatch, and return only the success of the action dispatch. Therefore, there is no way that direct user interaction with the Onyx Chat server can retrieve any sensitive information from the Onyx Core server.

This may seem like overkill, however privacy and security isn't the only convienience it provides. It is a very convenient way to dispatch actions as a result of user interaction, and provide arguments automatically to the actions.

### Using Triggers

The "triggers" property is simply another property on an intent datapoint. You can learn more about your corpora and specifying intents in the `Corpus` documentation. Here is an example of a trigger that you might implement for the intent "inquiry.contact_directly":

```json
{
  "intent": "inquiry.contact_directly",
  "triggers": [
    {
      "type": "notifications.specific_user",
      "args": {
        "user": "john.doe",
        "message": "Someone wants to talk to you! I've let them know to contact you directly."
      },
      "attachments": ["session_ip_address"]
    }
  ]
}
```

Let's go over what this means. The `type` property specifies the action string of the action to be dispatched. This will be the same as how it is defined in your Onyx Core configuration. Here, we want to dispatch an action called `notifications.specific_user`. The `args` property specifies the arguments to be passed to that action. The Onyx Core server will recognize these and pass them to the action. Here we are specifying that the user we want to notify is "john.doe", and the `message` we would like to send them is specified as well. The `attachments` property is an interesting one. Basically, this specifies a dynamic value that can be passed as an argument to the action. In this case, we are specifying the `session_ip_address` attachment, which is defined in `nlu/triggers.ts`. This method will grab the IP address of the current session, and pass that as an argument to the action. This means the action arguments will actually end up being passed as:

```json
{
  "user": "john.doe",
  "message": "Someone wants to talk to you! I've let them know to contact you directly.",
  "attachments": {
    "session_ip_address": "<ip_address>"
  }
}
```
