import { useState } from "react";
import Keyboard from "./setup_comp/Keyboard";
import Tablet from "./setup_comp/Tablet";
import { Setup } from "../../../resources/interfaces/user";
import { UserStore, UserStoreInt } from "../../../resources/global/user";
import { FaEdit, FaCheck, FaTimes, FaKeyboard, FaWheelchair } from "react-icons/fa";
import { FaComputer } from "react-icons/fa6";
import fina from "../../../helpers/fina";
import { ComputerInterface, KeyboardInterface, MouseInterface, TabletInterface } from "../../../resources/interfaces/setup";
import { useDivSize } from "../../../resources/hooks/globalHooks";
import { BsGpuCard } from "react-icons/bs";
import Mouse from "./setup_comp/Mouse";
import Computer from "./setup_comp/Computer";
import { useTranslation } from "react-i18next";

interface SetupPanelProps {
    id: number,
    setup: Setup | null,
    className: string;
    playstyle: string[] | null,
}

const SetupPanel = (p: SetupPanelProps) => {
    const {t} = useTranslation();

    const user = UserStore((state: UserStoreInt) => state.user);
    const me = user.id === p.id;

    const TABLET_EX: TabletInterface = {
        name: '',
        area: {
            w: 0,
            h: 0
        },
        position: {
            x: 0,
            y: 0,
            r: 0,
        },
        size: {
            w: 0,
            h: 0,
        },
    };
    const KEYBOARD_EX: KeyboardInterface = {
        name: '',
        layout: 'k60',
        keys: [],
    }
    const MOUSE_EX: MouseInterface = {
        name: "",
        dpi: 0
    }
    const COMPUTER_EX: ComputerInterface = {
        cpu: "",
        gpu: "",
        ram: "",
        psu: "",
        storage: "",
        mohterboard: "",
        case: "",
    }

    const [TABLET_INITIAL, setTABLET_INITIAL ] = useState<TabletInterface>(p.setup?.tablet || TABLET_EX);
    const [KEYBOARD_INITIAL, setKEYBOARD_INITIAL ] = useState<KeyboardInterface>(p.setup?.keyboard || KEYBOARD_EX);
    const [MOUSE_INITIAL, setMOUSE_INITIAL ] = useState<MouseInterface>(p.setup?.mouse || MOUSE_EX);
    const [COMPUTER_INITIAL, setCOMPUTER_INITIAL ] = useState<ComputerInterface>(p.setup?.computer || COMPUTER_EX);

    const [tabsIndex, setTabsIndex] = useState<number>(1);
    const [edit, setEdit] = useState<boolean>(false);

    const [keyboard, setKeyboard] = useState<KeyboardInterface>(KEYBOARD_INITIAL);
    const [mouse, setMouse] = useState<MouseInterface>(MOUSE_INITIAL);
    const [tablet, setTablet] = useState<TabletInterface>(TABLET_INITIAL);
    const [computer, setComputer] = useState<ComputerInterface>(COMPUTER_INITIAL);

    function handleEdit() {
        setEdit(true);
    }
    
    function handleCancel() {
        setKeyboard(KEYBOARD_INITIAL);
        setMouse(MOUSE_INITIAL);
        setTablet(TABLET_INITIAL);
        setComputer(COMPUTER_INITIAL);
        setEdit(false);
    }

    function handleSubmit() {
        fina.sput('/setup', {
            setup: {
                tablet,
                keyboard,
                mouse,
                computer
            }
        });
        setKEYBOARD_INITIAL(keyboard);
        setMOUSE_INITIAL(mouse);
        setTABLET_INITIAL(tablet);
        setCOMPUTER_INITIAL(computer);
        setEdit(false);
    }

    const {divPx, divRef} = useDivSize('w', 300);

    return (
        <div className={p.className}>
            <div className="shadow">
                <div className="flex flex-row gap-2 justify-center items-center p-2 bg-custom-800">
                    <FaComputer />
                    <div>{t('user.sections.setup.title')}</div>
                </div>
                <div className="grid grid-cols-6 items-center bg-custom-900">
                    <div className="col-span-4 col-start-2 justify-center content-center rounded-none bg-custom-900 tabs tabs-boxed">
                        <button onClick={() => setTabsIndex(1)}
                            className={`tab flex flex-row gap-2 ${tabsIndex === 1 && 'tab-active text-base-100'}`}>
                            <FaKeyboard />
                            <div>{t('user.sections.setup.tabs.inputs')}</div>
                        </button>
                        <button onClick={() => setTabsIndex(2)}
                            className={`tab flex flex-row gap-2 ${tabsIndex === 2 && 'tab-active text-base-100'}`}>
                            <FaWheelchair />
                            <div>{t('user.sections.setup.tabs.peripherals')}</div>
                        </button>
                        <button onClick={() => setTabsIndex(3)}
                            className={`tab flex flex-row gap-2 ${tabsIndex === 3 && 'tab-active text-base-100'}`}>
                            <BsGpuCard />
                            <div>{t('user.sections.setup.tabs.computer')}</div>
                        </button>
                    </div>
                    <div className="flex flex-row gap-2 justify-end pr-2">
                        <div hidden={edit || !me}>
                            <button onClick={handleEdit} className="btn btn-warning btn-sm">
                                <FaEdit />
                            </button>
                        </div>
                        <div hidden={!edit}>
                            <button onClick={handleSubmit} className="btn btn-success btn-sm">
                                <FaCheck />
                            </button>
                        </div>
                        <div hidden={!edit}>
                            <button onClick={handleCancel} className="btn btn-error btn-sm">
                                <FaTimes />
                            </button>
                        </div>
                    </div>
                </div>
                <div className={`flex items-center ${tabsIndex === 1 && p.playstyle && p.playstyle.length > 2 && 'overflow-x-scroll'}`} ref={divRef}>
                    <div className={`grow p-4 ${edit === false && 'c-normal'}`} hidden={tabsIndex !== 1}>
                        <div className="flex flex-row gap-6">
                            {p.playstyle?.includes('keyboard') && <Keyboard width={divPx / 2 - 30} height={228} keyboard={keyboard} setKeyboard={setKeyboard} edit={edit} />}
                            {p.playstyle?.includes('tablet') && <Tablet width={divPx / 2 - 30} height={228} tablet={tablet} setTablet={setTablet} edit={edit} />}
                            {p.playstyle?.includes('mouse') && <Mouse width={divPx / 2 - 30} height={228} mouse={mouse} setMouse={setMouse} edit={edit} />}
                        </div>
                    </div>
                    <div className="p-4 grow" hidden={tabsIndex !== 2}>

                    </div>
                    <div className="p-4 grow" hidden={tabsIndex !== 3}>
                        <Computer computer={computer} setComputer={setComputer} edit={edit} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SetupPanel;