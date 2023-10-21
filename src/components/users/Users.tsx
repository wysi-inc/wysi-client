import { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";

import UserCard from "./UserCard";
import fina from "../../helpers/fina";
import PageTabs from "../../web/w_comp/PageTabs";
import { modes } from "../../resources/global/user";
import { UserRanks } from "../../resources/types/user";
import { GameMode } from "../../resources/types/general";
import { alertManager, alertManagerInterface } from "../../resources/global/tools";
import { useQuery } from "react-query";

const Users = () => {

    const { t } = useTranslation();
    const addAlert = alertManager((state: alertManagerInterface) => state.addAlert);

    const [users, setUsers] = useState<UserRanks[]>([]);
    const [page, setPage] = useState<number>(1);
    const [actualPage, setActualPage] = useState<number>(1);
    const [category, setCategory] = useState<'performance' | 'score'>('performance');
    const [mode, setMode] = useState<GameMode>('osu');

    if (!users) return (<></>);

    async function getUsers(c: 'score' | 'performance', m: GameMode) {
        try {
            setUsers([]);
            setCategory(c)
            setMode(m);
            const d = await fina.post('/users', {
                mode: m,
                type: c,
                page: page,
            });
            const users: UserRanks[] = d.ranking;
            if (!users) return;
            return d.ranking;
        } catch (err) {
            console.error(err);
            addAlert('error', 'Failed to fetch users');
        }
    }

    return (
        <div className="flex flex-col gap-3 p-3">
            <div className="grid grid-cols-3">
                <div className="justify-start join">
                    <button className="font-bold join-item btn btn-secondary text-base-100"
                        onClick={() => {
                            getUsers('performance', mode);
                        }}>{t('user.performance')}</button>
                    <button className="font-bold join-item btn btn-secondary text-base-100"
                        onClick={() => {
                            getUsers('score', mode);
                        }}>{t('score.ranked_score')}</button>
                </div>
                <div className="flex justify-center">
                    <PageTabs setNewPage={setPage} current={page} min={1} max={200} />
                </div>
                <div className="justify-end join">
                    {modes.map(m =>
                        <button key={m}
                            className="font-bold join-item btn btn-secondary text-base-100"
                            onClick={() => {
                                getUsers(category, m);
                            }}>{m}</button>
                    )}
                </div>
            </div>
            <div className="p-3 rounded-xl bg-custom-900">
                <table className="w-full border-separate border-spacing-y-1">
                    <thead>
                        <tr>
                            <th className="table-cell text-left"></th>
                            <th className="table-cell text-left"></th>
                            <th className="table-cell text-left"></th>
                            <th className="table-cell text-left">PP</th>
                            <th className="hidden text-left lg:table-cell">{t('score.acc')}</th>
                            <th className="hidden text-left lg:table-cell">{t('user.play_time')}</th>
                            <th className="hidden text-left lg:table-cell">{t('user.play_count')}</th>
                            <th className="hidden text-left md:table-cell">{t('score.ranked_score')}</th>
                            <th className="hidden text-left xl:table-cell">{t('score.grades')}</th>
                            <th className="table-cell text-right">{t('user.online')}</th>
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
}
export default Users;