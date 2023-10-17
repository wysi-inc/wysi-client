import { useTranslation } from 'react-i18next';
import LanguageButton from "./LanguageButton";
import CountryFlag from '../../c_users/u_comp/CountryFlag';

const LanguagesSelect = () => {
    
    const { i18n } = useTranslation();

    const nameGenerator = new Intl.DisplayNames(i18n.language, { type: 'language' });
    const displayName = nameGenerator.of(i18n.language);

    function currentCode() {
        switch (i18n.language) {
            case 'ca':
                return 'cat';
            case 'en':
                return 'gb';
            case 'gl':
                return 'gal';
            case 'et':
                return 'ee';
            default:
                return i18n.language;
        }
    }

    return (
        <div className="dropdown dropdown-end">
            <label tabIndex={0} className='cursor-pointer'>
                <div style={{ height: 32 }}>
                    <CountryFlag size={24} name={displayName} code={currentCode()} position='l' />
                </div>
            </label>
            <div tabIndex={0} className="dropdown-content z-[10] menu p-2 gap-2 shadow bg-base-100 rounded-box w-max">
                <div className="grid grid-cols-2 gap-2">
                    <LanguageButton flag='za' code='za' name='afrikaans' nativeName='Afrikaans' />
                    <LanguageButton flag='cat' code='ca' name='catalan' nativeName='Català' />
                    <LanguageButton flag='de' code='de' name='german' nativeName='Deutsch' />
                    <LanguageButton flag='gb' code='en' name='english' nativeName='English' />
                    <LanguageButton flag='es' code='es' name='spanish' nativeName='Español' />
                    <LanguageButton flag='ee' code='et' name='estonian' nativeName='Eesti keel' />
                    <LanguageButton flag='gal' code='gl' name='galician' nativeName='Galego' />
                    <LanguageButton flag='it' code='it' name='italian' nativeName='Italiano' />
                    <LanguageButton flag='lv' code='lv' name='latvian' nativeName='Latviešu' />
                    <LanguageButton flag='hu' code='hu' name='hungarian' nativeName='Magyar' />
                    <LanguageButton flag='nl' code='nl' name='dutch' nativeName='Nederlands' />
                    <LanguageButton flag='no' code='no' name='norwegian' nativeName='Norsk' />
                    <LanguageButton flag='pl' code='pl' name='polish' nativeName='Polski' />
                    <LanguageButton flag='pt' code='pt' name='portuguese' nativeName='Português' />
                    <LanguageButton flag='br' code='br' name='portugueseBr' nativeName='Português' />
                    <LanguageButton flag='ru' code='ru' name='russian' nativeName='Русский' />
                    <LanguageButton flag='fi' code='fi' name='finnish' nativeName='Suomi' />
                    <LanguageButton flag='rs' code='rs' name='serbian' nativeName='Српски' />
                    <LanguageButton flag='tr' code='tr' name='turkish' nativeName='Türkçe' />
                    <LanguageButton flag='jp' code='jp' name='japanese' nativeName='日本語' />
                    <LanguageButton flag='cn' code='cn' name='chineseS' nativeName='简体中文' />
                    <LanguageButton flag='tw' code='tw' name='chineseT' nativeName='繁體中文' />
                    <LanguageButton flag='eo' code='eo' name='esperanto' nativeName='Esperanto' />
                </div>
                <a href="https://crowdin.com/project/wysi727" target="_blank" className="btn btn-info grow">
                    help
                </a>
            </div>
        </div>
    );
}

export default LanguagesSelect;