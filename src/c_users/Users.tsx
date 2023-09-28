import React, { useEffect, useState } from "react";

import { useParams } from "react-router-dom";

import UserPage from "./UserPage";
import UserCard from "./UserCard";
import axios from "../resources/axios-config";
import { GameModeType } from "../resources/types";
import PageTabs from "../c_web/w_comp/PageTabs";
import { UserRanks } from "../resources/interfaces/user";
import { useDebounce } from "@uidotdev/usehooks";
import { alertManager, alertManagerInterface } from "../resources/store";

const Users = () => {
    const addAlert = alertManager((state: alertManagerInterface) => state.addAlert);

    const { urlUser } = useParams();
    const { urlMode } = useParams();

    const [userId, setUserId] = useState<undefined | string>();
    const [userMode, setUserMode] = useState<undefined | GameModeType>();

    const [users, setUsers] = useState<UserRanks[]>([]);
    const [page, setPage] = useState<number>(1);
    const [actualPage, setActualPage] = useState<number>(1);
    const [category, setCategory] = useState<'performance' | 'score'>('performance');
    const [mode, setMode] = useState<GameModeType>('osu');

    const debouncedValue = useDebounce(page, 500);

    useEffect(() => {
        setUsers([]);
    }, [page])

    useEffect((): void => {
        setActualPage(page);
        if (urlUser === undefined) {
            setUserId(undefined);
            setUserMode(undefined);
            getUsers(category, mode);
        } else {
            const checkedMode: GameModeType = urlMode?.toLowerCase() as GameModeType;
            setUserMode(checkedMode ? checkedMode : 'default');
            setUserId(urlUser);
        }
    }, [urlUser, urlMode, debouncedValue]);

    if (userId && userMode) return (<UserPage userId={userId} userMode={userMode} />);

    if (!users) return (<></>);

    return (
        <div className="flex flex-col gap-3 p-3">
            <div className="grid grid-cols-3">
                <div className="justify-start join">
                    <button className="font-bold join-item btn btn-secondary text-base-100"
                        onClick={() => {
                            getUsers('performance', mode);
                        }}>Performance</button>
                    <button className="font-bold join-item btn btn-secondary text-base-100"
                        onClick={() => {
                            getUsers('score', mode);
                        }}>Ranked Score</button>
                </div>
                <div className="flex justify-center">
                    <PageTabs setNewPage={setPage} current={page} min={1} max={200} />
                </div>
                <div className="justify-end join">
                    <button className="font-bold join-item btn btn-secondary text-base-100"
                        onClick={() => {
                            getUsers(category, 'osu');
                        }}>osu</button>
                    <button className="font-bold join-item btn btn-secondary text-base-100"
                        onClick={() => {
                            getUsers(category, 'taiko');
                        }}>taiko</button>
                    <button className="font-bold join-item btn btn-secondary text-base-100"
                        onClick={() => {
                            getUsers(category, 'fruits');
                        }}>fruits</button>
                    <button className="font-bold join-item btn btn-secondary text-base-100"
                        onClick={() => {
                            getUsers(category, 'mania');
                        }}>mania</button>
                </div>
            </div>
            <div className="p-3 rounded-xl bg-accent-900">
                <table className="w-full border-separate border-spacing-y-1">
                    <thead>
                        <tr>
                            <th className="text-start"></th>
                            <th className="text-start"></th>
                            <th className="text-start"></th>
                            <th className="text-start">PP</th>
                            <th className="text-start">Acc</th>
                            <th className="text-start">Play Time</th>
                            <th className="text-start">Play Count</th>
                            <th className="text-start">Score</th>
                            <th className="text-start">Grades</th>
                        </tr>
                    </thead>
                    <tbody className="mt-3">
                        {users.length > 0 ?
                            users.map((user, index) =>
                                <UserCard mode={mode} user={user} category={category} index={index + (50 * (actualPage - 1) + 1)} key={index} />
                            ) :
                            <tr className="loading loading-dots loading-md"></tr>}
                    </tbody>
                </table>
            </div>
            {users.length > 0 && <PageTabs setNewPage={setPage} current={page} min={1} max={200} />}
        </div>
    );

    async function getUsers(c: 'score' | 'performance', m: GameModeType) {
        try {
            setUsers([]);
            setCategory(c)
            setMode(m);
            const res = await axios.post('/users',
                {
                    mode: m,
                    type: c,
                    page: page,
                }
            );
            const data: UserRanks[] = res.data.ranking;
            setUsers(data);
        } catch (err) {
            console.error(err);
            addAlert('error', 'Error: Failed to fetch users');
        }
    }
}
export default Users;