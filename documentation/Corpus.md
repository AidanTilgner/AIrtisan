# Corpus

### Default Corpus

You'll see under `nlu/documents/` that there is a file called `default_corpus.json`. This is where you will define your chatbot's interactions. You can specify intents here, and how the nlp engine should recognize them. To learn more about the nlp engine, see [nlp.js](https://github.com/axa-group/nlp.js), to learn more about corpora, see the nlp.js docs [here](https://github.com/axa-group/nlp.js/blob/master/docs/v4/quickstart.md#extracting-the-corpus-into-a-file).

### Data

In your corpus, you'll see that there is a `data` property, which is an array of objects. These objects specify how the chatbot should classify intents, and respond to them. The 3 required properties for any intent you add are `intent`, `utterances`, and `answers`. The `intent` property is simply the name of the intent. The `utterances` property is an array of strings, which are the ways the chatbot should recognize the intent. The `answers` property is an array of strings, which are the ways the chatbot should respond to the intent. You can also specify a `triggers` property, which is an array of objects, which specify actions to be dispatched when the intent is recognized. See the documentation on triggers for more information.

Here is an example of how to specify data for a new intent called `greeting.hello`:

```json
{
  "name": "Default Corpus",
  "locale": "en-US",
  "data": [
    {
      "intent": "greeting.hello",
      "utterances": ["Hello", "Hi", "Hey", "Howdy"],
      "answers": [
        "Hello, I'm Onyx!",
        "Hi, I'm Onyx!",
        "Hey, I'm Onyx!",
        "Howdy, I'm Onyx!"
      ],
      "enhance": true,
      "buttons": [
        {
          "type": "play_greeting",
        }
      ]
    }
  ]
}
```

By specifying this, when the user says "Hello", "Hi", "Hey", or "Howdy", the chatbot will recognize the intent `greeting.hello`, and respond with one of the answers specified. You can be more complex with your corpora, and I would recommend seeing the nlp.js docs for more information. On top of that, there are some Onyx specific feature that you can use to make your chatbot more interactive. For example, buttons, which defined in your corpora, and when an action is selected, all associated buttons will be sent to the client, which will ultimately decide what to do with them.
