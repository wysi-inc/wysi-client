import React, {useEffect, useState} from "react";
import axios from '../resources/axios-config';
import {
    BeatmapScore,
    MedalCategories,
    MedalInterface,
    MonthlyData, SortedMedals,
    UserAchievement,
    UserBadge,
    userData, UserGroup
} from "../resources/interfaces";
import {useParams} from "react-router-dom";
import Spinner from 'react-bootstrap/Spinner';
import ReactCountryFlag from "react-country-flag"
import moment from "moment";
import {colors} from "../resources/store";
import {addDefaultSrc, secondsToTime} from "../resources/functions";
import ScoreCard from "../components/ScoreCard";
import {Chart, registerables} from 'chart.js';
import {Line} from "react-chartjs-2";
import TopScoresPanel from "../components/TopScoresPanel";
import Medal from "../components/Medal";
import Badge from "../components/Badge";
import CountryShape from "../components/CountryShape";
import ModeSelector from "../components/ModeSelector";
import SupporterIcon from "../components/SupporterIcon";
import GroupBadge from "../components/GroupBadge";
import {BeatmapType, GameModeType} from "../resources/types";

Chart.register(...registerables);
Chart.defaults.font.family = "TorusRegular";
Chart.defaults.plugins.legend.display = false;
Chart.defaults.color = colors.ui.font;
Chart.defaults.animation = false;

type ModeSnap = "x" | "y" | "nearest" | "index" | "dataset" | "point" | undefined;

const UserPage = () => {
    const {urlUser} = useParams();
    const {urlMode} = useParams();

    const [userData, setUserData] = useState<userData | null>(null);
    const [gameMode, setGameMode] = useState<GameModeType>('osu');

    const beatmapReqLimit: number = 20;

    const [bestBeatmaps, setBestBeatmaps] = useState<BeatmapScore[]>([])
    const [recentBeatmaps, setRecentBeatmaps] = useState<BeatmapScore[]>([])
    const [pinnedBeatmaps, setPinnedBeatmaps] = useState<BeatmapScore[]>([])
    const [firstsBeatmaps, setFirstsBeatmaps] = useState<BeatmapScore[]>([])
    const [medals, setMedals] = useState<MedalInterface[]>([]);
    const [medalsSorted, setMedalsSorted] = useState<SortedMedals>({});

    const [historyTabIndex, setHistoryTabIndex] = useState<number>(0);
    const [scoresTabIndex, setScoresTabIndex] = useState<number>(0);

    useEffect((): void => {
        clearData();
        const checkedMode: GameModeType = urlMode?.toLowerCase() as GameModeType;
        if (urlUser !== undefined) {
            getUser(checkedMode ? checkedMode : 'default');
            getMedals();
        }
    }, [urlUser, urlMode]);

    useEffect((): void => {
        setHistoryTab()
    }, [userData]);

    if (urlUser === undefined) {
        return (
            <div>Search a user on the top bar</div>
        );
    }

    if (!userData) {
        return (
            <div style={{maxWidth: 1600}}
                 className="shadow backgroundColor flex-grow-1 w-100 d-flex flex-column align-items-centerx">
                <Spinner animation="border" role="status" className="mx-auto my-3">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </div>
        );
    }
    if (userData.is_bot) {
        return (
            <div>User is a bot, bots are not supported yet</div>
        );
    }
    if (userData.id === undefined) {
        return (
            <div>User not found</div>
        );
    }

    const rarestMedal: MedalInterface | null = getRarestMedal();

    const replaysHistoryData: any = {
        labels: getReplaysPlaysLabels(),
        datasets: [{
            label: 'Replays Watched',
            data: getReplaysData(),
            fill: false,
            borderColor: colors.charts.plays,
            tension: 0.1
        }]
    };
    const replaysHistoryOptions: any = {
        maintainAspectRatio: false,
        responsive: true,
        scales: {
            y: {
                reverse: false,
                ticks: {
                    precision: 0
                }
            },
        },
        elements: {
            point: {
                radius: 2
            }
        },
        interaction: {
            mode: 'index' as ModeSnap
        },
        plugins: {
            tooltip: {
                displayColors: false
            },
        },
    };

    const playsHistoryData: any = {
        labels: getPlaysLabels(),
        datasets: [{
            label: 'Play Count',
            data: getPlaysData(),
            fill: false,
            borderColor: colors.charts.plays,
            tension: 0.1
        }]
    };
    const playsHistoryOptions: any = {
        maintainAspectRatio: false,
        responsive: true,
        scales: {
            y: {
                reverse: false,
                ticks: {
                    precision: 0
                }
            },
        },
        elements: {
            point: {
                radius: 2
            }
        },
        interaction: {
            mode: 'index' as ModeSnap
        },
        plugins: {
            tooltip: {
                displayColors: false
            },
        },
    };

    const countryHistoryData: any = {
        labels: getCountryLabels(),
        datasets: [{
            label: 'Rank',
            data: getCountryData(),
            fill: false,
            borderColor: colors.charts.global,
            tension: 0.1,
        }],
    };
    const countryHistoryOptions: any = {
        maintainAspectRatio: false,
        responsive: true,
        scales: {
            y: {
                reverse: true,
                ticks: {
                    precision: 0
                }
            },
        },
        elements: {
            point: {
                radius: 2
            }
        },
        interaction: {
            mode: 'index' as ModeSnap
        },
        plugins: {
            tooltip: {
                displayColors: false
            },
        },
    };

    const globalHistoryData: any = {
        labels: getGlobalLabels(),
        datasets: [{
            label: 'Rank',
            data: getGlobalData(),
            fill: false,
            borderColor: colors.charts.global,
            tension: 0.1,
        }],
    };
    const globalHistoryOptions: any = {
        maintainAspectRatio: false,
        responsive: true,
        scales: {
            y: {
                reverse: true,
                ticks: {
                    precision: 0
                }
            },
        },
        elements: {
            point: {
                radius: 2
            }
        },
        interaction: {
            mode: 'index' as ModeSnap
        },
        plugins: {
            tooltip: {
                displayColors: false
            },
        },
    };

    function clearData(): void {
        setUserData(null);
        setBestBeatmaps([]);
        setRecentBeatmaps([]);
        setPinnedBeatmaps([]);
        setFirstsBeatmaps([]);
    }

    function getUser(mode: GameModeType): void {
        axios.post('/user', {
            id: urlUser,
            mode: mode
        })
            .then(async response => {
                setUserData(response.data);
                console.log(response.data);
                if (response.data.id) {
                    let searchMode: GameModeType;
                    if (mode === "default") {
                        searchMode = response.data.playmode;
                    } else {
                        searchMode = mode;
                    }
                    window.history.pushState({}, '', `/users/${response.data.id}/${searchMode}`);
                    setGameMode(searchMode);
                    let scoresTab: number = 0;
                    if (response.data.scores_recent_count > 0) {
                        setRecentBeatmaps(await getBeatmapScores(response.data.id, searchMode, 'recent', 0, beatmapReqLimit));
                        scoresTab = 4;
                    }
                    if (response.data.scores_first_count > 0) {
                        setFirstsBeatmaps(await getBeatmapScores(response.data.id, searchMode, 'firsts', 0, beatmapReqLimit));
                        scoresTab = 3
                    }
                    if (response.data.scores_best_count > 0) {
                        setBestBeatmaps(await getBeatmapScores(response.data.id, searchMode, 'best', 0, 100));
                        scoresTab = 2
                    }
                    if (response.data.scores_pinned_count > 0) {
                        setPinnedBeatmaps(await getBeatmapScores(response.data.id, searchMode, 'pinned', 0, 100));
                        scoresTab = 1
                    }
                    setScoresTabIndex(scoresTab);
                }
            })
            .catch(error => {
                console.error(error);
            });
    }

    async function getBeatmapScores(id: number, mode: GameModeType, type: BeatmapType, offset: number, limit: number): Promise<any> {
        const url: string = `https://osu.ppy.sh/users/${id}/scores/${type}?mode=${mode}&limit=${limit}&offset=${offset}`
        try {
            const response = await axios.post('/proxy', {url: url});
            return response.data;
        } catch (error) {
            console.error('Error fetching data:', error);
            throw error;
        }
    }

    function getMedals(): void {
        axios.post('/getMedals')
            .then((res) => {
                const data = res.data;
                data.sort((a: any, b: any) => {
                    return parseInt(a.MedalID) - parseInt(b.MedalID);
                });
                setMedals(data);
                data.sort((a: any, b: any) => {
                    if (a.Grouping === b.Grouping) {
                        return parseInt(a.value, 10) - parseInt(b.value, 10);
                    }
                    return a.Grouping.localeCompare(b.Grouping);
                });
                const categoryArrays: SortedMedals = {};
                for (const obj of data) {
                    if (categoryArrays[obj.Grouping]) {
                        categoryArrays[obj.Grouping].push(obj);
                    } else {
                        categoryArrays[obj.Grouping] = [obj];
                    }
                }
                setMedalsSorted(categoryArrays);
            })
            .catch((err) => {
                console.error(err);
            })
    }

    function getLastMedals(num: number): MedalInterface[] {
        const sortedArray = userData?.user_achievements
            .sort((a: UserAchievement, b: UserAchievement) => {
                const dateA: Date = new Date(a.achieved_at);
                const dateB: Date = new Date(b.achieved_at);
                return dateA.getTime() - dateB.getTime();
            });
        const lastMedals = sortedArray?.reverse().slice(0, num)
            .map((obj: UserAchievement) => obj.achievement_id);
        if (lastMedals) {
            return lastMedals
                .map((id: number) => medals.find((medal: any): boolean => parseInt(medal.MedalID) === id))
                .filter((medal: MedalInterface | undefined): medal is MedalInterface => medal !== undefined);
        } else {
            return [];
        }
    }

    function getAchievedMedalsCount(): MedalCategories {
        const achievedMedalsCount: MedalCategories = {};
        Object.entries(medalsSorted)
            .forEach(([category, medals]: [string, MedalInterface[]]) => {
                achievedMedalsCount[category] = 0;
                userData?.user_achievements.forEach((achievedMedal: UserAchievement): void => {
                    if (medals.find((medal: MedalInterface): boolean => parseInt(medal.MedalID) === achievedMedal.achievement_id)) {
                        achievedMedalsCount[category]++;
                    }
                });
            });
        return achievedMedalsCount;
    }

    function getRarestMedal(): MedalInterface | null {
        if (!userData) {
            return {} as MedalInterface;
        }
        return userData.user_achievements.map((obj: UserAchievement) => obj.achievement_id)
            .map((id: number) => medals.find((medal: MedalInterface): boolean => String(medal.MedalID) === String(id)))
            .reduce((rarest: MedalInterface | null, medal: MedalInterface | undefined): MedalInterface => {
                if (!rarest || (medal && medal.Rarity < rarest.Rarity)) {
                    return medal as MedalInterface;
                }
                return rarest;
            }, null)
    }

    function getGlobalLabels(): string[] {
        const num = userData?.rank_history?.data?.length ? userData.rank_history?.data?.length : 0;
        const today = new Date();
        let past90Days: string[] = [];
        for (let i = 0; i < num; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            past90Days.push(moment(date).format('DD MMM YYYY'));
        }
        return past90Days.reverse();
    }

    function getGlobalData(): number[] {
        if (!userData?.rank_history?.data) {
            return [];
        } else {
            return userData.rank_history.data;
        }
    }

    function getCountryLabels(): string[] {
        return [];
    }

    function getCountryData(): number[] {
        return [];
    }

    function getPlaysData(): number[] {
        if (!userData) {
            return [];
        }
        return userData.monthly_playcounts.map((obj: MonthlyData) => obj.count);
    }

    function getPlaysLabels(): string[] {
        if (!userData) {
            return [];
        }
        return userData.monthly_playcounts.map((obj: MonthlyData) => {
            return moment(new Date(obj.start_date)).format('MMM YYYY');
        });
    }

    function getReplaysData(): number[] {
        if (!userData) {
            return [];
        }
        return userData.replays_watched_counts.map((obj: MonthlyData) => obj.count);
    }

    function getReplaysPlaysLabels(): string[] {
        if (!userData) {
            return [];
        }
        return userData.replays_watched_counts.map((obj: MonthlyData) => {
            return moment(new Date(obj.start_date)).format('MMM YYYY');
        });
    }

    function setHistoryTab(): void {
        if (getReplaysData().length > 0) {
            setHistoryTabIndex(4);
        }
        if (getPlaysData().length > 0) {
            setHistoryTabIndex(3);
        }
        if (getCountryData().length > 0) {
            setHistoryTabIndex(2);
        }
        if (getGlobalData().length > 0) {
            setHistoryTabIndex(1);
        }
    }

    return (
        <div style={{maxWidth: 1600}} className="shadow backgroundColor align-self-center">
            <div className="d-flex" style={{backgroundImage: `url(${userData.cover_url})`, backgroundSize: "cover"}}>
                <div className="flex-grow-1" style={{backgroundColor: "#00000099", backdropFilter: "blur(4px)"}}>
                    <div className="d-flex flex-row flex-wrap gap-5 px-5 pt-5">
                        <div className="d-flex flex-column justify-content-center">
                            <img src={userData.avatar_url}
                                 onError={addDefaultSrc}
                                 alt='pfp' className="rounded-5 mb-3"
                                 style={{width: 256, height: 256}}/>
                            <div className="d-flex flex-row gap-2 align-items-center">
                                <div>{userData.statistics.level.current}</div>
                                <div className="progress flex-grow-1" style={{height: 4}}>
                                    <div className="progress-bar bg-warning"
                                         style={{width: `${userData.statistics.level.progress}%`}}></div>
                                </div>
                                <div>{userData.statistics.level.current + 1}</div>
                            </div>
                            <div className="text-center h6"
                                 data-tooltip-id="tooltip"
                                 data-tooltip-content={moment(userData.join_date, "YYYYMMDD").fromNow()}>
                                Joined at {moment(userData.join_date).format("DD/MM/YYYY")}
                            </div>
                        </div>
                        <div className="d-flex flex-row justify-content-between flex-grow-1">
                            <div className="d-flex flex-column">
                                <div className="mb-3">
                                    <div className="d-flex flex-row gap-3 align-items-center">
                                        <a className="h1 m-0 d-flex flex-row align-items-center gap-2 text-decoration-none"
                                           target={"_blank"}
                                           href={`https://osu.ppy.sh/users/${userData.id}`}>
                                            {userData.username}
                                        </a>
                                        {userData.groups.map((group: UserGroup, index: number) =>
                                            <GroupBadge group={group}
                                                        key={index + 1}/>
                                        )}
                                        {userData.is_supporter && <SupporterIcon size={32}/>}
                                    </div>
                                    <div className="profileTitle">{userData.title}</div>
                                </div>
                                <div>
                                    <div className="h6">Global Rank:</div>
                                    <div className="h3 d-flex flex-row align-items-center gap-2">
                                        <i className="bi bi-globe2"></i>
                                        <div>#{userData.statistics.global_rank?.toLocaleString()}</div>
                                    </div>
                                </div>
                                <div>
                                    <div className="h6">Country Rank:</div>
                                    <div className="h4 d-flex flex-row align-items-center gap-2">
                                        <CountryShape code={userData.country.code} width={32} height={32}/>
                                        <div>#{userData.statistics.country_rank?.toLocaleString()}</div>
                                        <ReactCountryFlag countryCode={userData.country.code}
                                                          data-tooltip-id="tooltip"
                                                          data-tooltip-content={userData.country.name}/>
                                    </div>
                                </div>
                                <div>
                                    <div className="h6">Performance:</div>
                                    <div className="h4 d-flex flex-row align-items-center gap-2">
                                        <div>{Math.round(userData.statistics.pp).toLocaleString()}pp</div>
                                    </div>
                                </div>
                                <div>
                                    <div className="h6">Accuracy:</div>
                                    <div className="h4 d-flex flex-row align-items-center gap-2">
                                        <div>{(userData.statistics.hit_accuracy).toFixed(2)}%</div>
                                    </div>
                                </div>
                            </div>
                            <div className="d-flex flex-column">
                                <ModeSelector mode={gameMode} userId={userData.id}/>
                                <div className="d-flex flex-row align-items-center gap-3">
                                    <div className="h5 d-flex flex-column align-items-center">
                                        <div style={{color: colors.ranks.xh}}>XH</div>
                                        <div>{userData.statistics.grade_counts.ssh}</div>
                                    </div>
                                    <div className="h5 d-flex flex-column align-items-center">
                                        <div style={{color: colors.ranks.x}}>X</div>
                                        <div>{userData.statistics.grade_counts.ss}</div>
                                    </div>
                                    <div className="h5 d-flex flex-column align-items-center">
                                        <div style={{color: colors.ranks.sh}}>SH</div>
                                        <div>{userData.statistics.grade_counts.sh}</div>
                                    </div>
                                    <div className="h5 d-flex flex-column align-items-center">
                                        <div style={{color: colors.ranks.s}}>S</div>
                                        <div>{userData.statistics.grade_counts.s}</div>
                                    </div>
                                    <div className="h5 d-flex flex-column align-items-center">
                                        <div style={{color: colors.ranks.a}}>A</div>
                                        <div>{userData.statistics.grade_counts.a}</div>
                                    </div>
                                </div>
                                <div>
                                    <div className="h6">Ranked Score:</div>
                                    <div className="h3 d-flex flex-row align-items-center gap-2">
                                        <i className="bi bi-chevron-double-up"></i>
                                        <div data-tooltip-id="tooltip"
                                             data-tooltip-content={`Total Score: ${userData.statistics.total_score.toLocaleString()}`}>
                                            {(userData.statistics.ranked_score).toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <div className="h6">Max Combo:</div>
                                    <div className="h4 d-flex flex-row align-items-center gap-2">
                                        <i className="bi bi-fire"></i>
                                        <div>{userData.statistics.maximum_combo.toLocaleString()}x</div>
                                    </div>
                                </div>
                                <div>
                                    <div className="h6">Play Count:</div>
                                    <div className="h4 d-flex flex-row align-items-center gap-2">
                                        <i className="bi bi-arrow-counterclockwise"></i>
                                        <div>{userData.statistics.play_count.toLocaleString()}</div>
                                    </div>
                                </div>
                                <div>
                                    <div className="h6">Play Time:</div>
                                    <div className="h4 d-flex flex-row align-items-center gap-2">
                                        <i className="bi bi-clock"></i>
                                        <div data-tooltip-id="tooltip"
                                             data-tooltip-content={secondsToTime(userData.statistics.play_time)}>
                                            {Math.round((userData.statistics.play_time / 60 / 60)).toLocaleString()}h
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div
                        className="d-flex flex-row flex-wrap gap-2 px-5 py-4 align-items-center justify-content-start">
                        {userData.badges.map((badge: UserBadge, index: number) =>
                            <Badge badge={badge} key={index + 1}/>
                        )}
                    </div>
                </div>
            </div>
            <div className="p-4 m-0 d-flex flex-row flex-wrap align-items-center gap-3 h6 shadow darkColor">
                <div className="d-flex flex-row align-items-center gap-2">
                    <i className="bi bi-people-fill"></i>
                    <div>Followers: {userData.follower_count.toLocaleString()}</div>
                </div>
                {userData.discord !== null &&
                    <div className="d-flex flex-row align-items-center gap-2">
                        <i className="bi bi-discord"></i>
                        <div>{userData.discord}</div>
                    </div>}
                {userData.twitter !== null && <div className="d-flex flex-row align-items-center gap-2">
                    <i className="bi bi-twitter"></i>
                    <div>{userData.twitter}</div>
                </div>}
                {userData.website !== null && <div className="d-flex flex-row align-items-center gap-2">
                    <i className="bi bi-globe"></i>
                    <div>{userData.website}</div>
                </div>}
                {userData.discord !== null && <div className="d-flex flex-row align-items-center gap-2">
                    <i className="bi bi-geo-alt-fill"></i>
                    <div>{userData.location}</div>
                </div>}
                {userData.interests !== null && <div className="d-flex flex-row align-items-center gap-2">
                    <i className="bi bi-suit-heart-fill"></i>
                    <div>{userData.interests}</div>
                </div>}
                {userData.occupation !== null && <div className="d-flex flex-row align-items-center gap-2">
                    <i className="bi bi-buildings"></i>
                    <div>{userData.occupation}</div>
                </div>}
            </div>
            <div className="p-4 pb-0">
                <div className="row">
                    <div className="col-12 col-xl-8">
                        <div className="d-flex flex-column">
                            <div className="rounded-3 overflow-hidden mb-4 darkColor shadow">
                                <div className="h4 p-2 m-0 titleColor d-flex flex-row gap-2 justify-content-center">
                                    <i className="bi bi-graph-up"></i>
                                    <div>History</div>
                                </div>
                                <nav className="row">
                                    <button
                                        disabled={getGlobalData().length === 0}
                                        className={`col border-0 rounded-0 p-2 d-flex flex-row gap-2 align-items-center justify-content-center ${historyTabIndex === 1 ? 'accentColor' : 'midColor'}`}
                                        onClick={() => setHistoryTabIndex(1)}>
                                        <i className="bi bi-globe2"></i>
                                        <div>Global Rank</div>
                                    </button>
                                    <button
                                        disabled={getCountryData().length === 0}
                                        className={`col border-0 rounded-0 p-2 d-flex flex-row gap-2 align-items-center justify-content-center ${historyTabIndex === 2 ? 'accentColor' : 'midColor'}`}
                                        onClick={() => setHistoryTabIndex(2)}>
                                        <CountryShape code={userData.country.code} width={24} height={24}/>
                                        <div>Country Rank</div>
                                    </button>
                                    <button
                                        disabled={getPlaysData().length === 0}
                                        className={`col border-0 rounded-0 p-2 d-flex flex-row gap-2 align-items-center justify-content-center ${historyTabIndex === 3 ? 'accentColor' : 'midColor'}`}
                                        onClick={() => setHistoryTabIndex(3)}>
                                        <i className="bi bi-arrow-counterclockwise"></i>
                                        <div>Play Count</div>
                                    </button>
                                    <button
                                        disabled={getReplaysData().length === 0}
                                        className={`col border-0 rounded-0 p-2 d-flex flex-row gap-2 align-items-center justify-content-center ${historyTabIndex === 4 ? 'accentColor' : 'midColor'}`}
                                        onClick={() => setHistoryTabIndex(4)}>
                                        <i className="bi bi-arrow-counterclockwise"></i>
                                        <div>Replays Watched</div>
                                    </button>
                                </nav>
                                <div style={{height: 250}} className="d-flex justify-content-center align-items-center">
                                    <div className="flex-grow-1 p-3" hidden={historyTabIndex !== 1}
                                         style={{height: 250}}>
                                        <Line data={globalHistoryData} options={globalHistoryOptions}/>
                                    </div>
                                    <div className="flex-grow-1 p-3 text-center h1" hidden={historyTabIndex !== 2}
                                         style={{height: 250}}>
                                        <Line data={countryHistoryData} options={countryHistoryOptions}/>
                                    </div>
                                    <div className="flex-grow-1 p-3" hidden={historyTabIndex !== 3}
                                         style={{height: 250}}>
                                        <Line data={playsHistoryData} options={playsHistoryOptions}/>
                                    </div>
                                    <div className="flex-grow-1 p-3" hidden={historyTabIndex !== 4}
                                         style={{height: 250}}>
                                        <Line data={replaysHistoryData} options={replaysHistoryOptions}/>
                                    </div>
                                </div>
                            </div>
                            <div className="rounded-3 overflow-hidden mb-4 darkColor shadow">
                                <div className="h4 p-2 m-0 titleColor d-flex flex-row gap-2 justify-content-center">
                                    <i className="bi bi-bar-chart-line"></i>
                                    <div>Top Play Stats</div>
                                </div>
                                <div className="p-3">
                                    <TopScoresPanel data={userData} best={bestBeatmaps}/>
                                </div>
                            </div>
                            <div className="rounded-3 overflow-hidden mb-4 darkColor shadow">
                                <div className="h4 p-2 m-0 titleColor d-flex flex-row gap-2 justify-content-center">
                                    <i className="bi bi-award"></i>
                                    <div>Medals</div>
                                </div>
                                <div className="row">
                                    <div className="col-12 col-lg p-0">
                                        <div className="text-center p-2 h5 midColor">
                                            Recent Medals
                                        </div>
                                        <div className="p-3 pt-2">
                                            <div className="d-flex flex-row justify-content-between pb-1 px-2"
                                                 style={{fontSize: 14, top: -8}}>
                                                <div>most recent</div>
                                                <div>least recent</div>
                                            </div>
                                            <div
                                                className="d-flex flex-row gap-1 overflow-hidden backgroundColor p-3 rounded">
                                                {getLastMedals(10).map((medal: MedalInterface, index: number) => (
                                                    <Medal thisMedal={medal} userMedals={userData.user_achievements}
                                                           key={index}/>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-12 col-lg-2 p-0">
                                        <div className="text-center p-2 h5 midColor">
                                            Rarest Medal
                                        </div>
                                        <div className="p-3 pt-2">
                                            <div className="pb-1 px-2 text-center"
                                                 style={{fontSize: 14, top: -8}}>
                                                Rarity: {parseFloat(rarestMedal?.Rarity ? rarestMedal.Rarity : '0').toFixed(2)}%
                                            </div>
                                            <div className="backgroundColor p-3 rounded d-grid justify-content-center">
                                                {rarestMedal &&
                                                    <Medal thisMedal={rarestMedal}
                                                           userMedals={userData.user_achievements}/>
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    {Object.entries(medalsSorted).map(([category, medals]: [string, MedalInterface[]], key: number) => (
                                        <div key={key}>
                                            <div
                                                className="text-center p-2 d-flex flex-row justify-content-center align-items-center midColor">
                                                <div className="h5 m-0 text-center">
                                                    {category}:
                                                </div>
                                            </div>
                                            <div className="p-3 pt-2">
                                                <div className="pb-1 px-2 text-center"
                                                     style={{fontSize: 14, top: -8}}>
                                                    {(getAchievedMedalsCount()[category] / medals.length * 100).toFixed(2)}%
                                                    ({getAchievedMedalsCount()[category]}/{medals.length})
                                                </div>
                                                <div
                                                    className="d-flex flex-row flex-wrap gap-1 justify-content-center backgroundColor p-3 rounded">
                                                    {medals.map((medal: MedalInterface, index: number) => (
                                                        <Medal thisMedal={medal} userMedals={userData.user_achievements}
                                                               key={index}/>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-12 col-xl-4 mb-4">
                        <div className="d-flex flex-column rounded-3 overflow-hidden darkColor shadow">
                            <div className="h4 text-center p-2 m-0 titleColor">
                                Scores
                            </div>
                            <nav className="row">
                                <button
                                    className={`col border-0 rounded-0 p-2 d-flex flex-row gap-2 align-items-center justify-content-center ${scoresTabIndex === 1 ? 'accentColor' : 'midColor'}`}
                                    onClick={() => setScoresTabIndex(1)}
                                    disabled={userData.scores_pinned_count === 0}>
                                    <i className="bi bi-pin-angle-fill"></i>
                                    <div>Pinned</div>
                                    <div className="badge darkColor rounded-pill">{userData.scores_pinned_count}</div>
                                </button>
                                <button
                                    className={`col border-0 rounded-0 p-2 d-flex flex-row gap-2 align-items-center justify-content-center ${scoresTabIndex === 2 ? 'accentColor' : 'midColor'}`}
                                    onClick={() => setScoresTabIndex(2)}
                                    disabled={userData.scores_best_count === 0}>
                                    <i className="bi bi-bar-chart-fill"></i>
                                    <div>Best</div>
                                    <div className="badge darkColor rounded-pill">{userData.scores_best_count}</div>
                                </button>
                                <button
                                    className={`col border-0 rounded-0 p-2 d-flex flex-row gap-2 align-items-center justify-content-center ${scoresTabIndex === 3 ? 'accentColor' : 'midColor'}`}
                                    onClick={() => setScoresTabIndex(3)}
                                    disabled={userData.scores_first_count === 0}>
                                    <i className="bi bi-star-fill"></i>
                                    <div>Firsts</div>
                                    <div className="badge darkColor rounded-pill">{userData.scores_first_count}</div>
                                </button>
                                <button
                                    className={`col border-0 rounded-0 p-2 d-flex flex-row gap-2 align-items-center justify-content-center ${scoresTabIndex === 4 ? 'accentColor' : 'midColor'}`}
                                    onClick={() => setScoresTabIndex(4)}
                                    disabled={userData.scores_recent_count === 0}>
                                    <i className="bi bi-alarm"></i>
                                    <div>Recent</div>
                                    <div className="badge darkColor rounded-pill">{userData.scores_recent_count}</div>
                                </button>
                            </nav>
                            <div style={{height: 2167}} className="flex-grow-1 overflow-y-scroll overflow-x-hidden">
                                <div hidden={scoresTabIndex !== 1}>
                                    {pinnedBeatmaps.length === 0 && userData.scores_pinned_count !== 0 &&
                                        <Spinner animation="border" role="status" className="mx-auto mt-4">
                                            <div className="visually-hidden">Loading...</div>
                                        </Spinner>}
                                    {pinnedBeatmaps.map((score: BeatmapScore, index: number) =>
                                        <ScoreCard index={index + 1} score={score} key={index + 1}/>)}
                                    {pinnedBeatmaps.length < userData.scores_pinned_count &&
                                        <button
                                            className="btn btn-success d-flex flex-row gap-2 justify-content-center w-100 rounded-pill"
                                            onClick={async () => {
                                                setPinnedBeatmaps([...pinnedBeatmaps, ...await getBeatmapScores(userData.id, gameMode, 'pinned', pinnedBeatmaps.length, beatmapReqLimit)]);
                                            }}>
                                            <i className="bi bi-caret-down-fill"></i>
                                            <div>Expand</div>
                                        </button>}
                                </div>
                                <div hidden={scoresTabIndex !== 2}>
                                    {bestBeatmaps.length === 0 && userData.scores_best_count !== 0 &&
                                        <Spinner animation="border" role="status" className="mx-auto mt-4">
                                            <div className="visually-hidden">Loading...</div>
                                        </Spinner>}
                                    {bestBeatmaps.map((score: BeatmapScore, index: number) =>
                                        <ScoreCard index={index + 1} score={score} key={index + 1}/>)}
                                    {bestBeatmaps.length < userData.scores_best_count &&
                                        <button
                                            className="btn btn-success d-flex flex-row gap-2 justify-content-center w-100 rounded-pill"
                                            onClick={async () => {
                                                setBestBeatmaps([...bestBeatmaps, ...await getBeatmapScores(userData.id, gameMode, 'best', bestBeatmaps.length, beatmapReqLimit)]);
                                            }}>
                                            <i className="bi bi-caret-down-fill"></i>
                                            <div>Expand</div>
                                        </button>}
                                </div>
                                <div hidden={scoresTabIndex !== 3}>
                                    {firstsBeatmaps.length === 0 && userData.scores_first_count !== 0 &&
                                        <Spinner animation="border" role="status" className="mx-auto mt-4">
                                            <div className="visually-hidden">Loading...</div>
                                        </Spinner>}
                                    {firstsBeatmaps.map((score: BeatmapScore, index: number) =>
                                        <ScoreCard index={index + 1} score={score} key={index + 1}/>)}
                                    {firstsBeatmaps.length < userData.scores_first_count &&
                                        <button
                                            className="btn btn-success d-flex flex-row gap-2 justify-content-center w-100 rounded-pill"
                                            onClick={async () => {
                                                setFirstsBeatmaps([...firstsBeatmaps, ...await getBeatmapScores(userData.id, gameMode, 'firsts', firstsBeatmaps.length, beatmapReqLimit)]);
                                            }}>
                                            <i className="bi bi-caret-down-fill"></i>
                                            <div>Expand</div>
                                        </button>}
                                </div>
                                <div hidden={scoresTabIndex !== 4}>
                                    {recentBeatmaps.length === 0 && userData.scores_recent_count !== 0 &&
                                        <Spinner animation="border" role="status" className="mx-auto mt-4">
                                            <span className="visually-hidden">Loading...</span>
                                        </Spinner>}
                                    {recentBeatmaps.map((score: BeatmapScore, index: number) =>
                                        <ScoreCard index={index + 1} score={score} key={index + 1}/>)}
                                    {recentBeatmaps.length < userData.scores_recent_count &&
                                        <button
                                            className="btn btn-success d-flex flex-row gap-2 justify-content-center w-100"
                                            onClick={async () => {
                                                setRecentBeatmaps([...recentBeatmaps, ...await getBeatmapScores(userData.id, gameMode, 'recent', recentBeatmaps.length, beatmapReqLimit)]);
                                            }}>
                                            <i className="bi bi-caret-down-fill"></i>
                                            <div>Expand</div>
                                        </button>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default UserPage;