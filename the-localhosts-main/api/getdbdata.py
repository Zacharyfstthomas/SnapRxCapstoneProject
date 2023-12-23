import pandas as pd
import argparse
import db
import json

if __name__ == '__main__':
    # parse arguments for data path
    parser = argparse.ArgumentParser()
    parser.add_argument('-path', default='./static/pillboxdata.csv')
    args = parser.parse_args()

    # parse input file to df
    try:
        df = pd.read_excel(open(args.path, 'rb'), header=0)
    except:
        df = pd.read_csv(open(args.path, 'rb'), header=0, skip_blank_lines=True)
    df = df[['splsize', 'splshape_text', 'splimprint', 'splcolor_text', 'spl_strength', 'spl_ingredients', 'spl_inactive_ing', 'source', 'rxstring', 'rxcui', 'medicine_name', 'author']]
    df = df.fillna('')

    # get price data
    price_data = {}
    with open('./static/price_data/amazondrugprice.json') as f:
        data = json.load(f)
        for _, item in enumerate(data):
            med_name = item['name'].split('(')[0].strip()
            med_price = float(item['price'].replace(',', '').replace('$', '').strip())
            price_data[med_name.lower()] = {
                'source': 'Amazon',
                'price': med_price
            }
    with open('./static/price_data/costcoprice.json') as f:
        data = json.load(f)
        for _, item in enumerate(data):
            med_name = item['name'].split('(')[0].strip()
            med_price = float(item['price'].replace(',', '').replace('$', '').strip())
            if med_name not in price_data or price_data[med_name]['price'] > med_price:
                price_data[med_name.lower()] = {
                    'source': 'Costco',
                    'price': med_price
                }

    # append price data to df
    df[['price', 'price_source']] = None
    for i, row in df.iterrows():
        med_name_l = row['medicine_name'].lower()
        if med_name_l in price_data:
            df.at[i, 'price'] = price_data[med_name_l]['price']
            df.at[i, 'price_source'] = price_data[med_name_l]['source']

    # write df to mysql
    for _, row in df.iterrows():
        imprints = str(row['splimprint']).split(';')
        db.create_medication(
            row['rxstring'],
            row['medicine_name'],
            f'Active ingredients: {row["spl_ingredients"]}. Inactive ingredients: {row["spl_inactive_ing"]}.',
            row['splshape_text'],
            row['splsize'] if row['splsize'] != '' else -1,
            imprints[0],
            imprints[1] if len(imprints) == 2 else '',
            row['splcolor_text'],
            row['price'],
            row['price_source']
        )
