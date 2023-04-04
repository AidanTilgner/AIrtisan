# Onyx Chat

Onyx Chat is a chatbot creation template which has all of the basic utilities you need to build a functioning chatbot. It uses [nlp.js](https://github.com/axa-group/nlp.js) to handle natural language processing, and [express.js](https://expressjs.com/) to allow communication through a rest api. This way, you can easily set up your own chatbot, and integrate it with your websites, apps, or other services.

## Getting Started

The first thing you'll want to do is clone this repository, or click the "Use this template" button to create a new repository from this one. I'd recommend the latter.

### Dependencies

Once you've done that, install the dependencies using your favorite package manager. By default, this is using [pnpm](https://pnpm.io/installation), which I would recommend. If you don't want to use pnpm, then you can just delete the `pnpm-lock.yaml` file, and use your favorite package manager instead.

### Database

Once you've installed all of the dependencies, make sure that a `datastore` directory exists in the root of your project, as node may throw an error if it doesn't. This will be where your `sqlite` database will be stored. Keep in mind, this project uses [typeorm](https://typeorm.io/) to handle your database, and so it's not too difficult to switch to a different database if you'd like.

### Configuration Files

There are a couple more files that you'll want to make sure are present in your app before you can get started.

- An `api-keys.json` file must be present in the root of your project. See the `api-keys.example.json` file for reference.
- A `storage/logs` directory must be present in the root of your project, as well as a `storage/metadata/` directory, and lastly a `storage/analytics` directory.
- A `.env` file must be present in the root of your project, see `.env.example` for reference.

Apologies for the tedius nature of this setup, the goal is that these files will automatically be generated in an initialization script in the future. Now that you've added these files and directories, you can start your dev server with the following command:

```bash
npm run dev
```

## Configuration

You may have noticed some configuration files in the above instructions, which will be used to configure the bahavior of your chatbot. Although there are a few files of importance here, the first one we'll talk about is the environment variables.

### Environment Variables

There are a few different environment variables to configure, and descriptions of all of them are in `.env.example`. The most important ones are your `NODE_ENV`, and your `OPENAI_API_KEY`, as these modify the behavior of Onyx Chat. If you have the `NODE_ENV` set to `development`, then things like authentication become lax, and you can utlize the training UI, which we'll talk about later. If you have the `NODE_ENV` set to `production`, then authentication will be strict, and the training UI will not be available, as you don't want it to be publically exposed. The behavior here may change in the future, but as of now this is the way it works.

As for your `OPENAI_API_KEY`, this is used to enhance certain chats, which we'll go into more detail about later as well. Basically, be sure to set this in your environment if you'd like spiced up chats.

### API Keys

The authentication method at the moment is a target of large scale refactoring, but does provide a sufficient layer of security. In the future the plan is to have API keys and other such operations controlled through a CLI. However, for now, API keys are hard coded, due to the initial small scale of the target use cases of this project. Basically, in order to allow a service to communicate with your chatbot, you'll need to specify an API key for them in the `api-keys.json` file you created earlier. Do this like the following:

```json
{
  "test_service": "test_api_key"
}
```

Now, if you'd like to make a request to the chatbot server from a different service, the service must include the `x-service` header, and `x-api-key` header in their request. The `x-service` header must match the name of the service you specified in the `api-keys.json` file, and the `x-api-key` header must match the api key you specified for that service. If these headers are not present, or do not match, then the request will be rejected.

Again, this is the future target of refactoring, but will provide a sufficient layer of security for the time being.

### ChatGPT Configuration

The ChatGPT configuration file, `chatgpt_config.json`, is how you will provide information to ChatGPT, in order to have your spiced up answers make the most sense, and seem the most natural. For examples of all of the properties you can use, refer to `chatgpt_config.example.json`, but there are some important considerations.

You'll want to refer to the initial prompt, which is currently defined in `nlu/enhancement.ts:6`. This is going to take your `chatgpt_config.json` file, and create an initial system prompt, which is will use to preface conversations with chatgpt, and get back the expected response. Although I tried to tailor this to be as general as possible, **you'll get the best performance if you refine the initial prompt yourself**. The initial prompt is a system prompt, and therefore the behavior of the chatbot will be greatly affected by it. I'd recommend understanding everything that's happening in `nlu/enhancement.ts`, and using that to squeeze the best performance out of ChatGPT, and your chatbot.

## NLU and Chatbot Training

So now the part you've been waiting for, actually training up your chatbot so that it works how you'd like. There are a couple ways to do this, but I'd recommend checking out the documentation in `documentation/Corpus.md`, as it will give you a good idea of the low level workings of the NLU, and how to train your chatbot. However, if you're more interested in a UI that will allow you to train your chatbot by talking to it, then read on.

### Training UI

Onyx Chat provides a UI that you can use to train your chatbot just by conversing with it. This isn't ready be default, so if you'd like to use it, you'll want to run the following command:

```bash
npm run build:training
```

This will build the training UI. Once you've done that, as long as you're in development mode, you can access the UI at `http://localhost:<port | 3000>/train`. Try out the url, and you should see an interface, with a prompt to "Say anything...". By default, the only intent that Onyx Chat knows about is `greeting.hello`, so try saying "Hello", and see what happens.

If everything is working as expected, you'll see a few sections pop up, giving you information about the NLU. For example, you can change the intent, and also specify whether or not the intent should be enhanced by ChatGPT. You can also modify answers, utterances, and buttons for a given intent. This UI is expected to be updated over time, but for now allows you to modify all of the important aspects of your chatbot.

**Let's try an example.** Try saying "Goobye". You'll see that Onyx Chat still thinks your intent is `greeting.hello`, and gives a response like "Hi! How can I help you?". This is because Onyx Chat needs to be told what the intent is when someone says "Goodbye", so that it can respond appropriately. To change this, go to the box that has the intent in it, should be the top right, and change it to `greeting.goodbye`, and click the "Update" button. You should see that now the intent has changed for the utterance "Goodbye", and you'll see in the preview that the new response is "Sorry, I don't understand".

This is a fallback response that the chatbot gives when it knows the intent, but there are no answers specified for that intent. So, go to the box that says "Add an answer for 'Goodbye'", and type in "Goodbye!", and click the "Add" button. Now, once it has refreshed, you'll see that the response has updated from the fallback, to "Goodbye!", which means it worked. You can see that this UI updated the `nlu/documents/default_corpus.json` file as well.

This is great! However, imagine that you say "See ya!", you might expect that your chatbot will think that you're saying goodbye, and respond accordingly. However, this is unfortunately not the case. In fact, the actual response will once again be "Sorry, I don't understand" because the intent is classified as "None". To fix this, we can once again modify the intent. Go to the box that says "None", and update it to `greeting.goodbye`, and click the "Update" button. Now, if you say "See ya!", you'll see that the response is "Goodbye!". Now you'll see that the response is correct, and the UI reflects that this will be the response for both "See ya!" and "Goodbye".

**Note** that although you will want to provide the chatbot with many difference examples of an intent, you don't have to specify everything exactly. The chatbot only needs an utterance to be similar to the intent, and it will classify it correctly. For example, if you say "See ya later", the chatbot will still classify it as `greeting.goodbye`, and respond with "Goodbye!". This is an example of where building up a corpus of utterances will help the chatbot to be more accurate.

### Enhancing Chatbot Responses
You may have noticed another option in the training UI, entitled "Enhance answers on this intent". If this box is checked on an intent, that means that Onyx Chat will attempt to have answers spiced up by ChatGPT. This is entirely optional, and is so far experimental. The idea is to make chatbot responses seem more natural, such as with chatgpt, but also maintain the safety and predictability of having predefined answers. This is a work in progress, and will be updated over time. Just check this box, and you'll see an `enhance: true` property on the corresponding `default_corpus.json` intent.

### Notes
If you have any questions or concerns, as well as ideas or suggestions, please feel free to open an issue, or reach out to me directly, you can find my contact info on [my website](https://aidantilgner.dev). I'm happy to help and excited to collaborate.