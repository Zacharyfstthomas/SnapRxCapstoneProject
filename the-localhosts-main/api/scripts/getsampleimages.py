import os
import shutil

DATA_ROOT = '../../model/data_full'

if __name__ == '__main__':
    # clear static/img
    for f in os.listdir('../static/img'):
        os.remove(f'../static/img/{f}')

    # get one sample image for each output class of the image classifier
    for root, _, files in os.walk(DATA_ROOT):
        class_name = root.split('\\')[-1].split('/')[-1]
        try:
            f = files[0]
            ext = f.split('.')[-1]
            if ext == 'JPG':
                shutil.copy(f'{root}/{f}', f'../static/img/{class_name}.JPG')
            elif ext == 'PNG':
                shutil.copy(f'{root}/{f}', f'../static/img/{class_name}.PNG')
            else:
                print('Invalid sample image extension.')
        except IndexError:
            continue
