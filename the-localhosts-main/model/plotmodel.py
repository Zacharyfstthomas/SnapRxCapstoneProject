from keras import layers, models
from keras.utils import plot_model

NUM_CLASSES = 213

# build model
model = models.Sequential([
    # Normalize input data
    layers.Rescaling(1./255, input_shape=(256, 256, 3)),
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
    layers.Dense(NUM_CLASSES, activation='softmax')
])
model.build()

# plot model
plot_model(model, to_file='model.png', show_shapes=True, show_layer_activations=True, show_dtype=True)
