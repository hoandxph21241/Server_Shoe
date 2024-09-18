
const statusMapping = {
    0: 'Đã nhận hàng',
    1: 'Chờ xác nhận',
    2: 'Chuẩn bị hàng',
    3: 'Chờ bàn giao đơn vị vận chuyển',
    4: 'Đang giao hàng',
    5: 'Giao thành công',
    6: 'Hủy đơn',
    7: 'Hoàn đơn'
};

document.addEventListener('DOMContentLoaded', () => {
    const completeButton = document.getElementById('complete-order-btn');

    if (completeButton) {
        completeButton.addEventListener('click', () => {
            const modal = new bootstrap.Modal(document.getElementById('failureReasonModal'));
            modal.show();
        });
    }
});
document.addEventListener('DOMContentLoaded', () => {
    const submitFailureReasonButton = document.getElementById('submitFailureReason');

    if (submitFailureReasonButton) {
        submitFailureReasonButton.addEventListener('click', async () => {
            const orderId = '<%= orderResponse._id %>';
            const failureReason = document.getElementById('failureReason').value;

            if (!failureReason) {
                alert('Vui lòng nhập lý do giao thất bại.');
                return;
            }

            try {
                const response = await fetch(`/order/refundOrder/${orderId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ failureReason }),
                });

                if (response.ok) {
                    const result = await response.json();
                    alert(result.message);
                    location.reload();
                } else {
                    const error = await response.json();
                    alert(error.message);
                }
            } catch (error) {
                console.error('Error completing order:', error);
                alert('Error completing order. Please try again.');
            }
        });
    }
});


document.getElementById('confirm-order-btn').addEventListener('click', () => {
    const currentStatus = '<%= orderResponse.status %>';
    let apiUrl = '';

    if (currentStatus == 1) {
        apiUrl = `/order/prepareOrder/<%= orderResponse._id %>`;
    } else if (currentStatus == 2) {
        apiUrl = `/order/orderPreparedSuccessfully/<%= orderResponse._id %>`;
    } else if (currentStatus == 3) {
        apiUrl = `/order/shipOrder/<%= orderResponse._id %>`;
    } else if (currentStatus == 4) {
        apiUrl = `/order/confirmOrder/<%= orderResponse._id %>`;
    } else {
        alert('Invalid order status for confirmation.');
        return;
    }

    const confirmOrderModal = new bootstrap.Modal(document.getElementById('confirmOrderModal'));
    confirmOrderModal.show();

    document.getElementById('confirm-order').addEventListener('click', async () => {
        try {
            const response = await fetch(apiUrl, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const result = await response.json();
                alert(result.message);
                location.reload();
            } else {
                const error = await response.json();
                alert(error.message);
            }
        } catch (error) {
            console.error('Error confirming order:', error);
            alert('Error confirming order. Please try again.');
        }
    });
});

document.getElementById('cancel-order-btn').addEventListener('click', () => {
    const cancelOrderModal = new bootstrap.Modal(document.getElementById('cancelOrderModal'));
    cancelOrderModal.show();
});

document.getElementById('cancel-order').addEventListener('click', async () => {
    const orderId = '<%= orderResponse._id %>';
    const cancelReason = document.getElementById('cancelReason').value;
    try {
        const response = await fetch(`/order/cancelOrder/${orderId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ cancelReason }),
        });

        if (response.ok) {
            const result = await response.json();
            alert(result.message);
            location.reload();
        } else {
            const error = await response.json();
            alert(error.message);
        }
    } catch (error) {
        console.error('Error canceling order:', error);
        alert('Error canceling order. Please try again.');
    }
});

