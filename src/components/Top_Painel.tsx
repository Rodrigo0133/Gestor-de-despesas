interface Props {
  route: string;
}

function Top_Painel({ route }: Props) {
  return (
    <div>
      <div>
        <p className="ml-2 hover:cursor-pointer ">
          <a href="/dashboard" className="hover:text-gray-600 transition-colors .5s">Painel</a> / {route}
        </p>
      </div>
    </div>
  );
}
export default Top_Painel;
