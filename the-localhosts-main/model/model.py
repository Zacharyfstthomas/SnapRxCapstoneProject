# model.py
# the image that the user takes need to send to the 'pred' folder and the image will get delete after the prediction.
# to test the model, you will need to put an image in 'pred' folder
# there is an image in 'pred' folder for testing
# the accuracy right now is fairly low (around 25%) because we dont have many data for training set which caused overfitting.
# will need to find a way to input more data into the training set if want to improve.
# need to run the model on cuda instead of cpu to speed up the time.
# the epoch is currently 1 (ideal epoch is 10) to speed up the return time of the model and because the dataset is small.

import torch
import glob
import torch.nn as nn
import torchvision
import pathlib
from torchvision.transforms import transforms
from torch.utils.data import DataLoader
from torch.optim import Adam
from torch.autograd import Variable
from PIL import Image
# import numpy as np
# import cv2
# import torch.functional as F
# from torchvision.models import squeezenet1_1
# from io import open

# Path for training and testing directories
TRAIN_PATH = './data/training'
TEST_PATH = './data/testing'
PRED_PATH = './data/pred'


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


# Prediction function
def predict(img_path, model, transformer, output_classes):
    image = Image.open(img_path)

    image_tensor = transformer(image).float()
    image_tensor = image_tensor.unsqueeze_(0)

    if torch.cuda.is_available():
        image_tensor.cuda()

    input = Variable(image_tensor)
    output = model(input)
    index = output.data.numpy().argmax()

    return output_classes[index]


def main():
    # Use CUDA if available, otherwise CPU
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

    # Input transformer (with horizontal flip)
    transformer = transforms.Compose([
        transforms.Resize((150, 150)),
        transforms.RandomHorizontalFlip(),
        transforms.ToTensor(),  # 0-255 to 0-1, numpy to tensors
        transforms.Normalize([0.5, 0.5, 0.5], [0.5, 0.5, 0.5])  # 0-1 to [-1,1] , formula (x-mean)/std
    ])

    train_loader = DataLoader(
        torchvision.datasets.ImageFolder(TRAIN_PATH, transform=transformer),
        batch_size=256, shuffle=True
    )
    test_loader = DataLoader(
        torchvision.datasets.ImageFolder(TEST_PATH, transform=transformer),
        batch_size=256, shuffle=True
    )

    # Output classes
    train_dir = pathlib.Path(TRAIN_PATH)
    output_classes = sorted([f.name.split('/')[-1] for f in train_dir.iterdir()])

    model = ConvNet(num_classes=5).to(device)

    # Optimizer and loss function
    optimizer = Adam(model.parameters(), lr=0.001, weight_decay=0.0001)
    loss_function = nn.CrossEntropyLoss()

    num_epochs = 10

    # calculating the size of training and testing images
    train_count = len(glob.glob(TRAIN_PATH + '/**/*.jpg'))
    test_count = len(glob.glob(TEST_PATH + '/**/*.jpeg'))

    # Main epoch loop
    best_accuracy = 0.0
    for epoch in range(num_epochs):
        # Train model
        model.train()
        train_accuracy = 0.0
        train_loss = 0.0
        for i, (images, labels) in enumerate(train_loader):
            if torch.cuda.is_available():
                images = Variable(images.cuda())
                labels = Variable(labels.cuda())

            optimizer.zero_grad()

            outputs = model(images)
            loss = loss_function(outputs, labels)
            loss.backward()
            optimizer.step()

            train_loss += loss.cpu().data*images.size(0)
            _, prediction = torch.max(outputs.data, 1)

            train_accuracy += int(torch.sum(prediction == labels.data))

        train_accuracy = train_accuracy/train_count
        train_loss = train_loss/train_count

        # Test model
        model.eval()
        test_accuracy = 0.0
        for i, (images, labels) in enumerate(test_loader):
            if torch.cuda.is_available():
                images = Variable(images.cuda())
                labels = Variable(labels.cuda())

            outputs = model(images)
            _, prediction = torch.max(outputs.data, 1)
            test_accuracy += int(torch.sum(prediction == labels.data))

        test_accuracy = test_accuracy/test_count

        print(f'Epoch: {str(epoch)} | Train Loss: {str(train_loss)} | Train Accuracy: {str(train_accuracy)} | Test Accuracy: {str(test_accuracy)}')

        # Save the best model
        if test_accuracy > best_accuracy:
            torch.save(model.state_dict(), 'best_checkpoint.model')
            best_accuracy = test_accuracy

    checkpoint = torch.load('best_checkpoint.model')
    model2 = ConvNet(num_classes=5)
    model2.load_state_dict(checkpoint)
    model2.eval()

    # Input transformer (without horizontal flip)
    transformer2 = transforms.Compose([
        transforms.Resize((150, 150)),
        transforms.ToTensor(),  # 0-255 to 0-1, numpy to tensors
        transforms.Normalize([0.5, 0.5, 0.5], [0.5, 0.5, 0.5])  # 0-1 to [-1,1] , formula (x-mean)/std
    ])

    image_paths = glob.glob(PRED_PATH + '/*.jpeg')

    pred_dict = {}

    for img_path in image_paths:
        pred_dict[img_path[img_path.rfind('/')+1:]] = predict(img_path, model2, transformer2, output_classes)
        print(predict(img_path, model2, transformer2, output_classes))


if __name__ == '__main__':
    main()
