// Format price in Indian Rupees with Indian number system
export function formatPrice(price) {
    const num = parseFloat(price);
    if (isNaN(num)) return '₹0';
    return '₹' + num.toLocaleString('en-IN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });
}

// Format number in Indian format (lakhs, crores)
export function formatNumber(num) {
    return parseInt(num).toLocaleString('en-IN');
}
