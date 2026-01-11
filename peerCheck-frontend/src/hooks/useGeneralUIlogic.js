


const useGeneral = () => {

    const getEfficiencyColor = (efficiency) => {
        if (efficiency === undefined || efficiency === null) return 'default';
        if (efficiency < 50) return 'error';
        if (efficiency < 80) return 'warning';
        if (efficiency > 120) return 'warning';
        return 'success';
    };

return{
    getEfficiencyColor
};

};

export default useGeneral;
