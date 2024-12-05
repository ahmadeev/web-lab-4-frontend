import React, { useState, useEffect } from 'react';
import {crudCreate, crudDelete, crudDeleteMany, crudRead, crudReadMany, crudUpdate} from "../utils/crud.js";
import {ShotRequestDTO} from "../utils/object.model.js";
import {useAuth} from "./utils/AuthProvider.jsx";

const ShotTable = ({ fetchData, readManyUrl, deleteOneUrl }) => {
    const { logout } = useAuth();

    const [data, setData] = useState([]);

    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);

    const [reload, setReload] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const handlePageChange = (direction) => {
        setPage((prevPage) => prevPage + direction);
    };

    const loadDataWrapper = async (func, args) => {
        try {
            const response = await func(...args);

            if (!response.ok) {
                if (response.status === 401)  {
                    console.log("401 Error processing table refresh")
                    logout();
                }
                throw new Error();
            }

            let responseData;
            try {
                responseData = await response.json();
            } catch (error) {
                console.error("Error reading response body", error);
            }
            console.log(responseData)
            return responseData;
            // раньше setReload(true) был тут
        } catch (error) {
            console.error("Error proccessing CRUD:", error);
            return null;
        } finally {
            setReload(true);
        }
    }

    useEffect(() => {
        const loadData = async () => {
            try {
                const response = await fetchData(readManyUrl, page, size); // асинхронно грузим страницу данных из БД

                if (!response.ok) {
                    if (response.status === 401)  {
                        console.log("Ошибка 401 при загрузке ShotTable")
                        logout();
                    }
                    throw new Error();
                }

                const responseData = await response.json();
                setData(responseData.data);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setReload(false);
                setIsLoading(false);
            }
        };

        loadData();

    }, [fetchData, readManyUrl, page, size, reload]); // пустой -- один раз. data не добавляем, иначе луп

    const BASE_URL = "http://localhost:8080/backend-jakarta-ee-1.0-SNAPSHOT/api/user";

    // Пример создания экземпляра
    const shot = new ShotRequestDTO(
        1,
        2,
        3
    );

    return (
        <>
            <button onClick={() => {
                loadDataWrapper(crudCreate, [`${BASE_URL}/shot`, shot]);
            }}>CREATE</button>

            <button onClick={() => {
                loadDataWrapper(crudDeleteMany, [`${BASE_URL}/shots`]);
            }}>DELETE MANY</button>

            <h1>Таблица проверок</h1>
            <table border="1">
                <thead>
                <tr>
                    <th>ID</th>
                    <th>x</th>
                    <th>y</th>
                    <th>r</th>
                    <th>hit</th>
                    <th>shot time</th>
                    <th>script time</th>
                    <th>REMOVE</th>
                </tr>
                </thead>
                <tbody>
                {isLoading && (
                    <tr>
                        <td colSpan="8" style={{textAlign: "center"}}>Загрузка данных...</td>
                    </tr>
                )}
                {!isLoading && (!data || !data.length) && (
                    <tr>
                        <td colSpan="8" style={{textAlign: "center"}}>Данные отсутствуют</td>
                    </tr>
                )}
                {data && data.map(item => (
                    <tr key={item.id}>
                        <td>{item.id}</td>
                        <td>{item.x}</td>
                        <td>{item.y}</td>
                        <td>{item.r}</td>
                        <td>{item.isHit}</td>
                        <td>{item.currentTime}</td>
                        <td>{item.scriptTime}</td>
                        <td>
                            <button onClick={() => {
                                loadDataWrapper(crudDelete, [deleteOneUrl, item.id])
                            }}>
                                X
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>

            <div>
                <button id="decrease-page" onClick={() => handlePageChange(-1)} disabled={page === 0}>left</button>
                <p>{page + 1}</p>
                <button id="increase-page" onClick={() => handlePageChange(1)} disabled={data.length < 10}>right</button>
            </div>

        </>
    );
};

export default ShotTable;