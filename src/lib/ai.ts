/**
 * AI-related functions
 * 
 * Code adapted from 'https://github.com/curiousily/todo-list-icon-classification-with-tensorflow-js/blob/master/src/suggestions/model.js'
 * all credit to the original author as linked above. (keep the great work up!)
 */

import * as tf from "@tensorflow/tfjs";
import * as tfvis from "@tensorflow/tfjs-vis";
import * as use from "@tensorflow-models/universal-sentence-encoder";

const learnTodos = await import("./data/learn_todos.json").then(module => module.default);
const exerciseTodos = await import("./data/exercise_todos.json").then(module => module.default);

const trainTasks = [
  ...learnTodos,
  ...exerciseTodos
];

const MODEL_NAME = "priority-model";
const N_CLASSES = 2;

const encodeData = async (encoder: use.UniversalSentenceEncoder, tasks: Array<{ text: string }>) => {
  const sentences = tasks.map(t => t.text.toLowerCase());
  
  const embeddings = await encoder.embed(sentences);
  return embeddings;
};

const trainModel = async (encoder: use.UniversalSentenceEncoder) => {
  try {
    const loadedModel = await tf.loadLayersModel(
      `localstorage://${MODEL_NAME}`
    );
    console.log("Using existing model");
    return loadedModel;
  } catch (e) {
    console.log("Training new model");
  }

  const xTrain = await encodeData(encoder, trainTasks);

  // Create one-hot encoded labels to match the categoricalCrossentropy + softmax output
  const yTrain = tf.oneHot(
    tf.tensor1d(trainTasks.map(t => t.priority), "int32"),
    N_CLASSES
  );

  const model = tf.sequential();

  model.add(
    tf.layers.dense({
      // use embedding vector length (features) as input shape, not number of examples
      inputShape: [xTrain.shape[1]],
      activation: "softmax",
      units: N_CLASSES
    })
  );

  model.compile({
    loss: "categoricalCrossentropy",
    optimizer: tf.train.adam(0.001),
    metrics: ["accuracy"]
  });

  const lossContainer = document.getElementById("loss-cont");

  await model.fit(xTrain, yTrain, {
    batchSize: 32,
    validationSplit: 0.1,
    shuffle: true,
    epochs: 500,
    callbacks: tfvis.show.fitCallbacks(
      lossContainer!,
      ["loss", "val_loss", "acc", "val_acc"],
      {
        callbacks: ["onEpochEnd"]
      }
    )
  });

  await model.save(`localstorage://${MODEL_NAME}`);

  return model;
};

const suggestPriority = async (model: tf.LayersModel, encoder: use.UniversalSentenceEncoder, taskName: string, threshold: number) => {
  if (!taskName.trim().length) {
    return null;
  }
  const xPredict = await encodeData(encoder, [{ text: taskName }]);

  const predictTensor = model.predict(xPredict) as tf.Tensor;
  const prediction = await predictTensor.data();

  await predictTensor.print();
  await predictTensor.dispose();

  return prediction[1]*100; // return priority as percentage
};

export { suggestPriority, trainModel, use, MODEL_NAME };