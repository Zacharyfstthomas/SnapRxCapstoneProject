import pickle
import numpy as np
from keras.utils import load_img, img_to_array
from keras.models import load_model

# load model data
model = load_model('../model/model.keras')
with open('../model/class_names.pickle', 'rb') as f:
    class_names = pickle.load(f)


# predict medication using trained image model
def predict(image_path):
    img = load_img(image_path, target_size=(128, 128))
    input_arr = img_to_array(img)
    output = model.predict(np.array([input_arr]))
    pred_ind = np.argmax(output)
    return class_names[pred_ind], output[0][pred_ind]
