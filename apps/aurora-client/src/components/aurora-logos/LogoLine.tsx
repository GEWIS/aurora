interface Props {
  variant: 'left' | 'right';
  size: string | number;
  dark?: boolean;
}

export function LogoLine({ variant, size, dark }: Props) {
  const renderHelmet = () => {
    return (
      <img
        src={!dark ? '/base/helmet-white.svg' : '/base/helmet-black.svg'}
        alt="Aurora"
        style={{ filter: 'invert(10%)', height: `calc(${size}  * 3)` }}
      />
    );
  };

  return (
    <div className="flex flex-row items-center">
      {variant === 'left' && renderHelmet()}
      <div className={'flex flex-col ' + (variant === 'left' ? 'items-start' : 'items-end')}>
        <span className={[!dark ? 'text-neutral-100' : 'text-black'].join(' ')} style={{ fontSize: size }}>
          Powered by Aurora
        </span>
        <span
          className={[!dark ? 'text-neutral-100' : 'text-black', 'italic'].join(' ')}
          style={{ fontSize: `calc(${size} * 0.3)` }}
        >
          Study Association GEWIS
        </span>
      </div>
      {variant === 'right' && renderHelmet()}
    </div>
  );
}
