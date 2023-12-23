# cropimages.py
# Crops borders out of prescription medication images for training data

import os
import argparse
from PIL import Image

if __name__ == '__main__':
    # command-line args
    #   -path: Path containing images to be cropped
    parser = argparse.ArgumentParser()
    parser.add_argument('-path', default='./data', help='Path containing images to be cropped.')
    args = parser.parse_args()

    # create output directory
    cropped_path = args.path + "/cropped_imgs"
    if not os.path.exists(cropped_path):
        os.mkdir(cropped_path)

    for image in os.listdir(args.path):
        print(image)
        if image.endswith(".jpg") and "RXNAVIMAGE" in image:
            print("image will be cropped")
            img = Image.open(args.path + image)
            box = (400, 400, 800, 800)
            cropped_img = img.crop(box)
            print(cropped_path + image + "cropped.jpg")
            cropped_img.save(cropped_path + image + "cropped.jpg")
