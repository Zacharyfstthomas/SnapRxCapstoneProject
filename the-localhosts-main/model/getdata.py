import urllib.request
import urllib
import pandas as pd
import os
import time

C3PI_ROOT = 'https://data.lhncbc.nlm.nih.gov/public/Pills'
DATA_ROOT = './data_full'
MIN_SAMPLES = 40


def download_image(url: str, filename: str):
    urllib.request.urlretrieve(url, filename=filename)


if __name__ == '__main__':
    # read all C3PI_Test image data into df
    df = pd.read_excel('directory_consumer_grade_images.xlsx', sheet_name='directory_of_images')
    df = df.loc[df['Layout'] == 'C3PI_Test']

    # filter out classes with less than {MIN_SAMPLES} samples
    med_classes = [g for _, g in df.groupby('Name') if len(g) >= MIN_SAMPLES]
    n_classes = len(med_classes)

    # create data_full dir if doesn't exist
    if not os.path.exists(DATA_ROOT):
        os.mkdir(DATA_ROOT)

    # iterate over class groups of med images
    start = time.time()
    for i, g in enumerate(med_classes):
        print(f'Downloading images for medication class {i+1}/{n_classes}...')

        # create a directory in data_full to store samples from the class
        class_label = g.iloc[0]["Name"].replace('/', '-')
        class_path = f'{DATA_ROOT}/{class_label}'
        if not os.path.exists(class_path):
            os.mkdir(class_path)

        # download all samples from class into ./data_full/{class}
        processes = []
        for _, row in g.iterrows():
            # check for valid image type
            file_type = row['Image'].split('.')[-1]
            if file_type != 'JPG' and file_type != 'JPEG' and file_type != 'PNG':
                continue

            # fetch image from C3PI server
            download_image(f'{C3PI_ROOT}/{row["Image"]}', f'{class_path}/{row["Image"].split("/")[-1]}')

    end = time.time()
    print(f'Completed in {end-start}s')
