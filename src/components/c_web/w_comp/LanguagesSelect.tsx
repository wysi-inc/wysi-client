import { useTranslation } from 'react-i18next';
import LanguageButton from "./LanguageButton";
import CountryFlag from '../../c_users/u_comp/CountryFlag';
import { getLang } from '../../../resources/global/languages';
import { availableLanguages } from '../../../resources/langs';
import { useState } from 'react';

const LanguagesSelect = () => {

    const { t, i18n } = useTranslation();
    const [code, flag, name, nativeName] = getLang(i18n.language);
    const [clicked, setClicked] = useState<boolean>(false);

    return (
        <div className="dropdown dropdown-end">
            <label tabIndex={0} className='cursor-pointer'>
                <div style={{ height: 32 }}>
                    <CountryFlag size={24} name={nativeName} code={flag} position='l' />
                </div>
            </label>
            <div tabIndex={0} className="dropdown-content z-[10] menu p-2 gap-2 shadow-lg bg-custom-950 rounded-box w-max">
                <div className="grid grid-cols-2 gap-2">
                    {availableLanguages.map((lang) => 
                        <LanguageButton code={lang} key={lang}/>
                    )}
                </div>
                <a href="https://crowdin.com/project/wysi"
                    target="_blank" rel="noreferrer" className="btn btn-info grow">
                    {t('nav.help')}
                </a>
            </div>
        </div>
    );
}

export default LanguagesSelect;