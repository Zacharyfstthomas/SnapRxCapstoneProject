# classifier.py
# Image classification model for prescription medications

import torch
import torch.nn as nn
from torchvision.transforms import transforms
from torch.autograd import Variable
from PIL import Image

# TODO: output classes should not be hardcoded, should be saved/loaded alongside model
output_classes = ['allopurinol', 'amitriptyline', 'amoxicillin', 'aspirin', 'lipitor']


# CNN Network
class ConvNet(nn.Module):
    def __init__(self, num_classes=5):
        super(ConvNet, self).__init__()

        # Output size after convolution filter
        # ((w-f+2P)/s) +1

        # Input shape= (256,3,150,150)
        self.conv1 = nn.Conv2d(in_channels=3, out_channels=12, kernel_size=3, stride=1, padding=1)
        # Shape= (256,12,150,150)
        self.bn1 = nn.BatchNorm2d(num_features=12)
        # Shape= (256,12,150,150)
        self.relu1 = nn.ReLU()
        # Shape= (256,12,150,150)

        self.pool = nn.MaxPool2d(kernel_size=2)
        # Reduce the image size be factor 2
        # Shape= (256,12,75,75)

        self.conv2 = nn.Conv2d(in_channels=12, out_channels=20, kernel_size=3, stride=1, padding=1)
        # Shape= (256,20,75,75)
        self.relu2 = nn.ReLU()
        # Shape= (256,20,75,75)

        self.conv3 = nn.Conv2d(in_channels=20, out_channels=32, kernel_size=3, stride=1, padding=1)
        # Shape= (256,32,75,75)
        self.bn3 = nn.BatchNorm2d(num_features=32)
        # Shape= (256,32,75,75)
        self.relu3 = nn.ReLU()
        # Shape= (256,32,75,75)

        self.fc = nn.Linear(in_features=75 * 75 * 32, out_features=num_classes)

    # Feed forward function
    def forward(self, input):
        # First 2D convolutional layer, batch normalization, ReLU activation
        output = self.conv1(input)
        output = self.bn1(output)
        output = self.relu1(output)

        # Max pool 2D layer
        output = self.pool(output)

        # Second 2D convolutional layer, ReLU activation
        output = self.conv2(output)
        output = self.relu2(output)

        # Third 2D convolutional layer, batch normalization, ReLU activation
        output = self.conv3(output)
        output = self.bn3(output)
        output = self.relu3(output)

        # Above output will be in matrix form, with shape (256,32,75,75)
        output = output.view(-1, 32 * 75 * 75)

        # Linear layer for classification output
        output = self.fc(output)
        return output


# Load CNN image classification model
model = ConvNet()
model.load_state_dict(torch.load('../model/best_checkpoint.model'))
model.eval()


# Prescription medication prediction with trained model
def predict(img_path):
    """
    Predict medication from image using trained model.

    :param img_path: path to temp image file on the server
    :return: predicted medication
    """
    image = Image.open(img_path)

    transformer = transforms.Compose([
        transforms.Resize((150, 150)),
        transforms.ToTensor(),  # 0-255 to 0-1, numpy to tensors
        transforms.Normalize([0.5, 0.5, 0.5], [0.5, 0.5, 0.5])  # 0-1 to [-1,1] , formula (x-mean)/std
    ])
    image_tensor = transformer(image).float()
    image_tensor = image_tensor.unsqueeze_(0)

    if torch.cuda.is_available():
        image_tensor.cuda()

    input_data = Variable(image_tensor)
    output = model(input_data)
    index = output.data.numpy().argmax()

    return output_classes[index]
