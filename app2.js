import 'dotenv/config';
import express from 'express';
import {
  CopilotRuntime,
  LangChainAdapter,
  OpenAIAdapter,
  copilotRuntimeNodeHttpEndpoint,
} from '@copilotkit/runtime';

import {ChatGoogle} from '@langchain/google-gauth';
import OpenAI from 'openai';

const app = express();
// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const serviceAdapter = new LangChainAdapter({
    chainFn: async ({ messages, tools }) => {
        const model = new ChatGoogle({
            modelName: 'gemini-1.5-pro-002',
            apiVersion: 'v1beta',

        }).bindTools([
            ...tools,
            {"google_search_retrieval": {
                "dynamic_retrieval_config": {
                    "mode": "unspecified",
                    "dynamic_threshold": 0.06
                }
            }}
        ])
        return model.stream(messages);
    }
});

app.use('/copilotkit', (req, res, next) => {
  const runtime = new CopilotRuntime();
  const handler = copilotRuntimeNodeHttpEndpoint({
    endpoint: '/copilotkit',
    runtime,
    serviceAdapter,
  });

  return handler(req, res, next);
});

app.listen(4000, () => {
  console.log('Listening at http://localhost:4000/copilotkit');
});
