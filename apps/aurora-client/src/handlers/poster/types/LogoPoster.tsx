export default function LogoPoster() {
  return (
    <div
      className="absolute top-0 left-0 w-full h-full
      flex flex-col justify-center items-center
      overflow-hidden bg-gewis bg-center bg-cover bg-no-repeat"
      style={{ backgroundImage: 'url("base/poster-background.png")' }}
    >
      <div className="w-1/3 h-full flex flex-col justify-center items-center">
        <img alt="GEWIS" src="/base/gewis-color.svg" className="gewis-logo" />
      </div>
      <div className="progress-bar-height flex-1" />
    </div>
  );
}
