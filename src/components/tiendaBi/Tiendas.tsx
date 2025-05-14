import '../css/Tiendas.css'

function PowerBIGrafico() {
  return (
    <div className="grafico-container">
      <div className="grafico-responsive">
        <iframe
          title="Gráfico de Ubicaciones"
          src="https://app.powerbi.com/view?r=eyJrIjoiMDk1MDhjYmYtYzEzYS00ZjcxLWE3MzYtNTY0ZTJiNzVmOTA0IiwidCI6IjVmNTNiNGNlLTYzZDQtNGVlOC04OGQyLTIyZjBiMmQ0YjI3YSIsImMiOjR9"
        ></iframe>
      </div>
    </div>
  );
}

export default PowerBIGrafico;
