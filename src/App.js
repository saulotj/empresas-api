import React, { useState, useEffect } from 'react';
import './App.css';
import Table from 'react-bootstrap/Table';
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';

function App() {
  const [inputCnpj, setInputCnpj] = useState('');
  const [data, setData] = useState([]);
  const [filterType, setFilterType] = useState('recent'); 
  

  useEffect(() => {
    const fetchData = async (cnpj) => {
      const response = await fetch(`https://spl.sisdel.com.br/api/empresa/${cnpj}`);
      const data = await response.json();
      return data;
    };

    const defaultCnpjs = [];

    const fetchDataForCnpjs = async () => {
      const fetchedData = [];
      await Promise.all(
        defaultCnpjs.map(async cnpj => {
          const newData = await fetchData(cnpj);
          fetchedData.push(newData);
        })
      );
      const sortedData = filterType === 'recent' ?
        fetchedData.sort((a, b) => new Date(b.data_atualiza) - new Date(a.data_atualiza)) :
        fetchedData.sort((a, b) => new Date(a.data_atualiza) - new Date(b.data_atualiza));
      setData(sortedData);
    };

    fetchDataForCnpjs();
  }, [filterType]);

    const dateTime = (dateString) => {
    const date = new Date(dateString);
    

    const parameters = {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    };

    return date.toLocaleDateString('pt-BR', parameters);
  };

 const currentDate = () => {
    const date = new Date();
    const parameters = {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    };
    return date.toLocaleDateString('pt-BR', parameters);
  }

  const handleSearch = async () => {
    if (inputCnpj.trim() !== '') {
      const response = await fetch(`https://spl.sisdel.com.br/api/empresa/${inputCnpj}`);
      const newData = await response.json();
      const cnpjExists = data.find(item => item.cnpj === newData.cnpj);
      if (cnpjExists) {
        alert(`Dado já presente na lista!\nCNPJ: ${cnpjExists.cnpj}\nCodigo Empresa: ${cnpjExists.codemp? cnpjExists.codemp : cnpjExists.id_pd}\nRazão Social: ${cnpjExists.razao_social}`);
      } else {
      const updatedData = [...data, newData];
      const sortedData = filterType === 'recent' ?
        updatedData.sort((a, b) => new Date(b.data_atualiza) - new Date(a.data_atualiza)) :
        updatedData.sort((a, b) => new Date(a.data_atualiza) - new Date(b.data_atualiza));
        setData(sortedData);
        setInputCnpj('');
      } 
    }
  };

  const handleReprocess = async (cnpj) => {
    const response = await fetch(`https://spl.sisdel.com.br/api/empresa/${cnpj}`);
    const newData = await response.json();
    const updatedData = data.map(item => {
      if(item.cnpj === cnpj) {
        console.log(newData);
        return newData;
        
      }
      return item;
    });
    setData(updatedData);
  }

  return (
    <div>
      <InputGroup className="w-50">
        <Form.Control
          placeholder="CNPJ"
          aria-label="CNPJ"
          aria-describedby="CNPJ"
          value={inputCnpj}
          onChange={(e) => setInputCnpj(e.target.value.replace(/[^0-9]+/g, ""))}
        />
        <Button variant="outline-secondary" id="button-addon2" onClick={handleSearch}>
          Buscar
        </Button>
        <Button variant="outline-secondary" onClick={() => setFilterType('recent')}>
          Mais recente
        </Button>
        <Button variant="outline-secondary" onClick={() => setFilterType('old')}>
          Mais antiga
        </Button>
      </InputGroup>
      <div>
      <Table striped bordered hover size="sm">
          <thead>
            <tr>
              <th>Codigo empresa</th>
              <th>Razão Social</th>
              <th>Data Atualização</th>
              <th>Data Atual</th>
              <th>Botão Atualizar</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index}>
                <td>{item.codemp? item.codemp : item.id_pd}</td>
                <td>{item.razao_social? item.razao_social : item.erro}</td>
                <td>
                  {dateTime(item.data_atualiza) === "31 de dezembro de 1969"? 'Sem data processada' : dateTime(item.data_atualiza)}
                </td>
                <td>{currentDate()}</td>
                <td>
                <Button variant="outline-secondary" onClick={() => handleReprocess(item.cnpj)}>
                  Reprocessar
                </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  );
}

export default App;

