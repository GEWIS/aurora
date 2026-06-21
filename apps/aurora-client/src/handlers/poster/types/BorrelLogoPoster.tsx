export default function BorrelLogoPoster() {
  return (
    <div
      className="w-full h-full
      flex flex-col justify-center items-center gap-8
      bg-bac bg-cover text-shadow
      text-white text-8xl pb-10"
      style={{ textShadow: '0 0 32px black' }}
    >
      <div className="font-extrabold" style={{ fontFamily: 'CrayonCrumble' }}>
        This borrel is powered by
      </div>
      <div className="h-1/2">
        <img
          alt="sudosos"
          className="h-full"
          src="/borrel/sudosos.svg"
          style={{ filter: 'drop-shadow(0 0px 10px rgba(0, 0, 0, 0.4))' }}
        />
      </div>
      <div className="text-9xl" style={{ fontFamily: 'Raleway' }}>
        SudoSOS
      </div>
    </div>
  );
}
