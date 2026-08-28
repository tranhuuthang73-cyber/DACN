/**
 * TravelGo - Live Auto-suggest & Search Autocomplete
 * Bắt sự kiện gõ phím và fetch kết quả từ /api/search/suggest
 */

document.addEventListener('DOMContentLoaded', () => {
    const searchInputs = document.querySelectorAll('[data-live-suggest]');

    searchInputs.forEach(input => {
        const wrapper = input.parentElement;
        wrapper.style.position = 'relative';

        // Tạo container gợi ý
        const dropdown = document.createElement('div');
        dropdown.className = 'live-suggest-dropdown';
        dropdown.style.cssText = `
            display: none;
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: white;
            border-radius: var(--radius-md);
            box-shadow: var(--shadow-xl);
            border: 1px solid var(--gray-200);
            z-index: 1000;
            max-height: 380px;
            overflow-y: auto;
            margin-top: 6px;
        `;
        wrapper.appendChild(dropdown);

        let debounceTimer;

        input.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            const query = e.target.value.trim();

            if (query.length < 2) {
                dropdown.style.display = 'none';
                dropdown.innerHTML = '';
                return;
            }

            debounceTimer = setTimeout(async () => {
                try {
                    const response = await fetch(`/api/search/suggest?q=${encodeURIComponent(query)}`);
                    const res = await response.json();

                    if (!res.success || (!res.data.locations.length && !res.data.trips.length && !res.data.hotels.length)) {
                        dropdown.innerHTML = `<div style="padding: 12px 16px; color: var(--gray-400); font-size: 0.85rem;">Không tìm thấy địa điểm hoặc chuyến đi nào phù hợp.</div>`;
                        dropdown.style.display = 'block';
                        return;
                    }

                    let html = '';

                    // 1. Địa điểm
                    if (res.data.locations && res.data.locations.length > 0) {
                        html += `<div style="padding: 8px 16px; font-size: 0.75rem; font-weight: 700; color: var(--gray-400); text-transform: uppercase; background: var(--gray-50);">Địa điểm du lịch</div>`;
                        res.data.locations.forEach(loc => {
                            html += `
                                <a href="/trips?arrival=${loc.id}" style="display: flex; align-items: center; gap: 10px; padding: 10px 16px; border-bottom: 1px solid var(--gray-100); text-decoration: none; color: var(--gray-800); transition: background 0.15s;" onmouseover="this.style.background='var(--gray-50)'" onmouseout="this.style.background='white'">
                                    <div style="width: 28px; height: 28px; border-radius: var(--radius-sm); background: var(--primary-50); color: var(--primary); display: flex; align-items: center; justify-content: center;">
                                        <i data-lucide="map-pin" style="width: 14px; height: 14px;"></i>
                                    </div>
                                    <div>
                                        <div style="font-weight: 600; font-size: 0.9rem;">${loc.name}</div>
                                        <div style="font-size: 0.75rem; color: var(--gray-500);">${loc.province || ''}</div>
                                    </div>
                                </a>
                            `;
                        });
                    }

                    // 2. Chuyến đi
                    if (res.data.trips && res.data.trips.length > 0) {
                        html += `<div style="padding: 8px 16px; font-size: 0.75rem; font-weight: 700; color: var(--gray-400); text-transform: uppercase; background: var(--gray-50);">Chuyến đi / Tour</div>`;
                        res.data.trips.forEach(trip => {
                            html += `
                                <a href="/trips/detail/${trip.id}" style="display: flex; justify-content: space-between; align-items: center; padding: 10px 16px; border-bottom: 1px solid var(--gray-100); text-decoration: none; color: var(--gray-800); transition: background 0.15s;" onmouseover="this.style.background='var(--gray-50)'" onmouseout="this.style.background='white'">
                                    <div>
                                        <div style="font-weight: 600; font-size: 0.9rem;">${trip.departure_name} → ${trip.arrival_name}</div>
                                        <div style="font-size: 0.75rem; color: var(--gray-500);">${trip.formatted_date} • ${trip.vehicle_name}</div>
                                    </div>
                                    <strong style="color: var(--secondary); font-size: 0.9rem;">${trip.formatted_price}</strong>
                                </a>
                            `;
                        });
                    }

                    // 3. Khách sạn
                    if (res.data.hotels && res.data.hotels.length > 0) {
                        html += `<div style="padding: 8px 16px; font-size: 0.75rem; font-weight: 700; color: var(--gray-400); text-transform: uppercase; background: var(--gray-50);">Khách sạn</div>`;
                        res.data.hotels.forEach(h => {
                            html += `
                                <a href="/hotels/detail/${h.id}" style="display: flex; justify-content: space-between; align-items: center; padding: 10px 16px; border-bottom: 1px solid var(--gray-100); text-decoration: none; color: var(--gray-800); transition: background 0.15s;" onmouseover="this.style.background='var(--gray-50)'" onmouseout="this.style.background='white'">
                                    <div>
                                        <div style="font-weight: 600; font-size: 0.9rem;">${h.name}</div>
                                        <div style="font-size: 0.75rem; color: var(--gray-500);">${h.location_name} • ★ ${h.star_rating} sao</div>
                                    </div>
                                </a>
                            `;
                        });
                    }

                    dropdown.innerHTML = html;
                    dropdown.style.display = 'block';
                    if (window.lucide) lucide.createIcons();

                } catch (err) {
                    console.error('Search suggest error:', err);
                }
            }, 250);
        });

        // Đóng dropdown khi click ra ngoài
        document.addEventListener('click', (e) => {
            if (!wrapper.contains(e.target)) {
                dropdown.style.display = 'none';
            }
        });
    });
});
