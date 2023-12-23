import tensorflow as tf
import matplotlib.pyplot as plt
import pickle
from keras import layers, models
from keras.utils import image_dataset_from_directory
from keras.losses import SparseCategoricalCrossentropy

DATA_ROOT = './data_full'
BATCH_SIZE = 32
IMG_HEIGHT = 256
IMG_WIDTH = 256

# get training dataset
train_dataset = image_dataset_from_directory(
    DATA_ROOT,
    validation_split=0.2,
    subset='training',
    seed=123,
    batch_size=BATCH_SIZE,
    image_size=(IMG_HEIGHT, IMG_WIDTH)
)

# get validation dataset
val_dataset = image_dataset_from_directory(
    DATA_ROOT,
    validation_split=0.2,
    subset='validation',
    seed=123,
    batch_size=BATCH_SIZE,
    image_size=(IMG_HEIGHT, IMG_WIDTH)
)

# get class names, save to pickle file
class_names = train_dataset.class_names
with open('class_names.pickle', 'wb') as f:
    pickle.dump(class_names, f)

# prefetching
AUTOTUNE = tf.data.AUTOTUNE
train_dataset = train_dataset.cache().prefetch(buffer_size=AUTOTUNE)
val_dataset = val_dataset.cache().prefetch(buffer_size=AUTOTUNE)

# build model
model = models.Sequential([
    # Normalize input data
    layers.Rescaling(1./255, input_shape=(IMG_HEIGHT, IMG_WIDTH, 3)),
    # Note the input shape is the desired size of the image 150x150 with 3 bytes color
    # This is the first convolution
    layers.Conv2D(64, (3,3), activation='relu'),
    layers.MaxPooling2D(2, 2),
    # The second convolution
    layers.Conv2D(64, (3,3), activation='relu'),
    layers.MaxPooling2D(2,2),
    # The third convolution
    layers.Conv2D(128, (3,3), activation='relu'),
    layers.MaxPooling2D(2,2),
    # The fourth convolution
    layers.Conv2D(128, (3,3), activation='relu'),
    layers.MaxPooling2D(2,2),
    # Flatten the results to feed into a DNN
    layers.Flatten(),
    # tf.keras.layers.Dropout(0.5),
    # 256 neuron hidden layers
    layers.Dense(512, activation='relu'),
    layers.Dense(1024, activation='relu'),
    layers.Dense(len(class_names), activation='softmax')
])
model.build()

# compile model
model.compile(optimizer='adam',
              loss=SparseCategoricalCrossentropy(from_logits=True),
              metrics=['accuracy'])

# get model summary
model.summary()

# fit model
history = model.fit(
    train_dataset,
    validation_data=val_dataset,
    epochs=20
)

# save model
model.save('model.keras')

# save training history
with open('training_history.pickle', 'wb') as f:
    pickle.dump(history.history, f)

# plot training accuracy history
plt.plot(history.history['accuracy'])
plt.title('Accuracy vs. Epoch')
plt.xlabel('Epoch')
plt.ylabel('Accuracy')
plt.savefig('model_accuracy_plot.png')
