interface Props {
  size: string | number;
  dark?: boolean;
}

export function LogoCentered({ size, dark }: Props) {
  return (
    <div className="flex flex-col items-center">
      <img
        src={!dark ? '/base/helmet-white.svg' : '/base/helmet-black.svg'}
        alt="Aurora"
        style={{ filter: 'invert(10%)', height: `calc(${size} * 5)` }}
      />
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
  );
}
