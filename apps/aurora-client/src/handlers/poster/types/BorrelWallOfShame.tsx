import { CSSProperties, useEffect, useState } from 'react';
import { getSudoSosWallOfShame, SudoSosDebtorResponse } from '../../../api';
import VerticalScroll from '../../../components/VerticalScroll';
import { bacShadow, redShadow } from '../../../style/shadows';

interface Props {
  visible: boolean;
}

export default function BorrelWallOfShamePoster({ visible }: Props) {
  const [debtors, setDebtors] = useState<SudoSosDebtorResponse[]>([]);

  // TODO what if data is not fetched?
  useEffect(() => {
    getSudoSosWallOfShame()
      .then((res) => {
        if (res && res.data) setDebtors(res.data);
      })
      .catch((e) => console.error(e));
  }, []);

  return (
    <div
      className="text-white w-full h-full text-5xl"
      style={{
        background: 'url("/borrel/shame.gif") no-repeat center center fixed',
        backgroundSize: 'cover',
        textShadow: 'black 0 0 0.5rem',
      }}
    >
      <VerticalScroll visible={visible} items={debtors.length}>
        <div className="w-screen p-20">
          <table id="tvpc-schandpaal-table" className="w-full border-separate border-spacing-6">
            <tbody>
              <tr>
                <td colSpan={3} className="tvpc-schandpaal-title pb-10">
                  <h1 className="text-9xl text-center">SudoSOS Wall of Shame</h1>
                </td>
              </tr>
              <tr className="tvpc-schandpaal-table-header">
                <th className="text-left"></th>
                <th className="text-right pe-8">Debt</th>
                <th className="fine">Fine</th>
              </tr>
              {debtors.map((debtor, i) => {
                let fontSizeClass: string = '';
                switch (i) {
                  case 0:
                    fontSizeClass = 'text-7xl';
                    break;
                  case 1:
                    fontSizeClass = 'text-6xl';
                    break;
                  case 2:
                    fontSizeClass = 'text-5xl';
                    break;
                  default:
                    break;
                }

                const name = debtor.nickName
                  ? `${debtor.firstName} "${debtor.nickName}" ${debtor.lastName}`
                  : `${debtor.firstName} ${debtor.lastName}`;

                let style: CSSProperties | undefined;
                if (debtor.isBac) {
                  style = bacShadow;
                } else if (debtor.isLongstanding) {
                  style = redShadow;
                }

                return (
                  <tr key={debtor.userId} className={fontSizeClass} style={style}>
                    <td className="text-left">{name}</td>
                    <td className="text-right whitespace-nowrap pe-8">
                      € {(debtor.balance.amount / 100).toFixed(debtor.balance.precision)}
                    </td>
                    {debtor.fine ? (
                      <td className="text-right whitespace-nowrap">
                        € {(debtor.fine.amount / 100).toFixed(debtor.fine.precision)}
                      </td>
                    ) : (
                      <td></td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </VerticalScroll>
    </div>
  );
}
