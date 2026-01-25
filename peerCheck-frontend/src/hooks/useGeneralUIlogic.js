import { useTheme } from "@mui/system";


const useGeneral = () => {
    const theme = useTheme();

    const getEfficiencyColor = (efficiency) => {
        if (efficiency === undefined || efficiency === null) return 'default';
        if (efficiency < 50) return theme.palette.error.main;
        if (efficiency < 80) return theme.palette.warning.main;
        if (efficiency > 120) return theme.palette.warning.main;
        return theme.palette.success.main;
    };

return{
    getEfficiencyColor
};

};

export default useGeneral;
