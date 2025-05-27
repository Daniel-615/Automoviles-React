import '../css/Tiendas.css'

function PowerBIGrafico() {
  return (
    <div className="grafico-container">
      <div className="grafico-responsive">
        <iframe
          title="CUBOS_OLAP" width="1400" height="740" 
          src="https://app.powerbi.com/view?r=eyJrIjoiZTkyM2UyNTAtYTBiMi00Mjk4LWE4MWYtYzY5ZGZiZGE2NTkzIiwidCI6IjVmNTNiNGNlLTYzZDQtNGVlOC04OGQyLTIyZjBiMmQ0YjI3YSIsImMiOjR9"
        ></iframe>
      </div>
    </div>
  );
}
export default PowerBIGrafico;
