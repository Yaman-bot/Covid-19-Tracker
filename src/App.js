import React, { useState, useEffect } from 'react';
import { MenuItem, FormControl, Select, Card, CardContent, Tab } from '@material-ui/core'

import InfoBox from './InfoBox'
import Map from './Map'
import Table from './Table'
import LineGraph from './LineGraph'
import {sortData,prettyPrintStat} from './util'
import './App.css';
import "leaflet/dist/leaflet.css";

function App() {
  const [countries, setCountries] = useState([])
  const [country, setCountry] = useState('worldwide')
  const [countryInfo, setCountryInfo] = useState({})
  const [tableData,setTableData]=useState([])
  const [mapCenter, setMapCenter] = useState({ lat: 28.7041, lng: 77.1025 });
  const [mapZoom, setMapZoom] = useState(3);
  const [mapCountries, setMapCountries] = useState([]);
  const [casesType, setCasesType] = useState("cases");

  useEffect(()=>{
    const fetchWorldwideData=async ()=>{
      const response=await fetch("https://disease.sh/v3/covid-19/all")
      const responseData=await response.json()
      setCountryInfo(responseData)
    }
    fetchWorldwideData()
  },[])

  useEffect(() => {
    const getCountriesData = async () => {
      const response = await fetch("https://disease.sh/v3/covid-19/countries")
      const responseData = await response.json()
      const countries = responseData.map((country) => ({
        name: country.country,
        value: country.countryInfo.iso2  //US,UK
      }))

      const sortedData=sortData(responseData)

      setTableData(sortedData)
      setMapCountries(responseData);
      setCountries(countries);
    }
    getCountriesData()
  }, [])

  const onCountryChange = async (event) => {
    const countryCode = event.target.value

    const url=countryCode==='worldwide' ? "https://disease.sh/v3/covid-19/all" :`https://disease.sh/v3/covid-19/countries/${countryCode}`

    const response=await fetch(url)
    const responseData=await response.json()
    setCountry(countryCode)
    setCountryInfo(responseData)

    if(countryCode === 'worldwide'){
      setMapCenter(mapCenter);
      setMapZoom(mapZoom);
    } else {
      setMapCenter([responseData.countryInfo.lat, responseData.countryInfo.long]);
      setMapZoom(4);
    };

  }

  return (
    <div className="app">
      <div className="app__left">
        <div className="app__header">
          <h1>COVID-19 Tracker</h1>
          <FormControl className="app__dropdown">
            <Select variant="outlined" onChange={onCountryChange} value={country}>
              <MenuItem value="worldwide">Worldwide</MenuItem>
              {countries.map((country) => (
                <MenuItem value={country.value}>{country.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
        <div className="app__stats">
          <InfoBox
            isRed
            active={casesType === "cases"}
            onClick={e => setCasesType('cases')}
            title="Coronavirus Cases Today"
            cases={prettyPrintStat(countryInfo.todayCases)}
            total={prettyPrintStat(countryInfo.cases)}
          />
          <InfoBox
            active={casesType === "recovered"}
            onClick={e => setCasesType('recovered')}
            title="Recovered Today"
            cases={prettyPrintStat(countryInfo.todayRecovered)}
            total={prettyPrintStat(countryInfo.recovered)}
          />
          <InfoBox
            isRed
            active={casesType === "deaths"}
            onClick={e => setCasesType('deaths')}
            title="Deaths Today"
            cases={prettyPrintStat(countryInfo.todayDeaths)}
            total={prettyPrintStat(countryInfo.deaths)}
          />
        </div>
        <Map 
          casesType={casesType}
          countries={mapCountries} 
          center={mapCenter} 
          zoom={mapZoom} 
        />
      </div>

      <Card className="app__right">
        <CardContent>
          <h3 className="app__rightTableTitle">Live cases by country</h3>
          <Table countries={tableData} />
          <h3 className="app__rightGraphTitle">Worldwide {casesType} </h3>
          <LineGraph className="app__graph" casesType={casesType} />
        </CardContent>   
      </Card>
      
    </div>
  );
}

export default App;
