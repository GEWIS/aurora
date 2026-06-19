import { useEffect, useMemo, useState } from 'react';
import { getSudoSosPriceList, ProductCategoryResponse, ProductResponse } from '../../../api';
import VerticalScroll from '../../../components/VerticalScroll';

interface Props {
  visible: boolean;
}

export default function BorrelPriceListPoster({ visible }: Props) {
  const [products, setProducts] = useState<Map<number, ProductResponse[]>>(new Map());
  const [productCategories, setProductCategories] = useState<Map<number, ProductCategoryResponse>>(new Map());

  useEffect(() => {
    // TODO what to do if data is not fetched?
    getSudoSosPriceList()
      .then((res) => {
        if (!res || !res.data) return;
        // Mapping from category ID to products
        const productMap = new Map<number, ProductResponse[]>();
        const categoryMap = new Map<number, ProductCategoryResponse>();

        res.data.forEach((p) => {
          if (productMap.has(p.category.id)) {
            productMap.get(p.category.id)!.push(p);
          } else {
            productMap.set(p.category.id, [p]);
          }
          if (!categoryMap.has(p.category.id)) {
            categoryMap.set(p.category.id, p.category);
          }
        });

        setProducts(productMap);
        setProductCategories(categoryMap);
      })
      .catch((e) => console.error(e));
  }, []);

  const leftColumn = useMemo(() => {
    return [...productCategories.keys()].sort()[0];
  }, [productCategories]);
  const rightColumn = useMemo(() => {
    return [...productCategories.keys()].sort().slice(1);
  }, [productCategories]);

  const getProductTable = (categoryId: number) => {
    if (!products.has(categoryId)) return null;

    const category = productCategories.get(categoryId)!;
    const categoryProducts = products.get(categoryId)!.sort((a, b) => {
      if (a.preferred && b.preferred) {
        if (a.name < b.name) return -1;
        if (a.name > b.name) return 1;
        return 0;
      }
      if (a.preferred) return 1;
      if (b.preferred) return -1;
      if (a.name < b.name) return -1;
      if (a.name > b.name) return 1;
      return 0;
    });

    return (
      <table className="w-full border-separate border-spacing-4" key={categoryId}>
        <thead>
          <tr>
            <th colSpan={2}>{category.name}</th>
          </tr>
        </thead>
        <tbody>
          {categoryProducts.map((p) => (
            <tr key={p.id}>
              <td className="text-left">{p.name}</td>
              <td className="text-right whitespace-nowrap">
                € {(p.priceInclVat.amount / 100).toFixed(p.priceInclVat.precision)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div
      className="h-full w-full px-20 py-16 text-5xl text-white overflow-hidden bg-bac bg-cover"
      style={{
        textShadow: 'black 0 0 0.5rem',
      }}
    >
      <div className="mb-10 flex gap-10 items-center">
        <h1 className="text-8xl">Price list</h1>
        <p className="italic text-2xl font-light">
          * Payments only via SudoSOS (sudosos.gewis.nl)
          <br />
          ** Assortment may vary; ask at the bar for current availability
        </p>
      </div>
      <VerticalScroll visible={visible}>
        <div className="grid grid-cols-2 gap-32 w-full font-lato">
          <div className="flex flex-col gap-10">{leftColumn && getProductTable(leftColumn)}</div>
          <div className="flex flex-col gap-10">{rightColumn.map((c) => getProductTable(c))}</div>
        </div>
      </VerticalScroll>
    </div>
  );
}
