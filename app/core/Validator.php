<?php
/**
 * TravelGo - Input Validator
 * 
 * Validate dữ liệu đầu vào với các rule phổ biến.
 * 
 * Sử dụng:
 *   $validator = new Validator($_POST, [
 *       'email'    => 'required|email|max:100',
 *       'password' => 'required|min:6|max:255',
 *       'phone'    => 'phone',
 *       'age'      => 'numeric|min_value:1|max_value:150',
 *   ]);
 *   if ($validator->fails()) {
 *       $errors = $validator->errors();
 *   }
 */

namespace App\Core;

class Validator
{
    private array $data;
    private array $rules;
    private array $errors = [];

    /**
     * Labels tiếng Việt cho các field phổ biến
     */
    private array $labels = [
        'username'    => 'Tên đăng nhập',
        'email'       => 'Email',
        'password'    => 'Mật khẩu',
        'full_name'   => 'Họ tên',
        'phone'       => 'Số điện thoại',
        'company_name'=> 'Tên công ty',
        'address'     => 'Địa chỉ',
        'description' => 'Mô tả',
        'name'        => 'Tên',
        'price'       => 'Giá',
        'quantity'    => 'Số lượng',
        'num_passengers' => 'Số hành khách',
        'num_rooms'   => 'Số phòng',
        'check_in_date' => 'Ngày nhận phòng',
        'check_out_date'=> 'Ngày trả phòng',
        'departure_datetime' => 'Ngày giờ khởi hành',
    ];

    public function __construct(array $data, array $rules, array $customLabels = [])
    {
        $this->data = $data;
        $this->rules = $rules;
        $this->labels = array_merge($this->labels, $customLabels);
        $this->validate();
    }

    /**
     * Chạy validation
     */
    private function validate(): void
    {
        foreach ($this->rules as $field => $ruleString) {
            $rules = explode('|', $ruleString);
            $value = $this->data[$field] ?? null;
            $label = $this->labels[$field] ?? $field;

            foreach ($rules as $rule) {
                $params = [];
                if (str_contains($rule, ':')) {
                    [$rule, $paramStr] = explode(':', $rule, 2);
                    $params = explode(',', $paramStr);
                }

                $method = 'rule' . ucfirst($rule);
                if (method_exists($this, $method)) {
                    $error = $this->$method($field, $value, $label, $params);
                    if ($error) {
                        $this->errors[$field] = $error;
                        break; // Dừng validate field này khi gặp lỗi đầu tiên
                    }
                }
            }
        }
    }

    /**
     * Kiểm tra có lỗi không
     */
    public function fails(): bool
    {
        return !empty($this->errors);
    }

    /**
     * Lấy danh sách lỗi
     */
    public function errors(): array
    {
        return $this->errors;
    }

    /**
     * Lấy lỗi đầu tiên
     */
    public function firstError(): ?string
    {
        return $this->errors ? reset($this->errors) : null;
    }

    /**
     * Lấy lỗi của 1 field cụ thể
     */
    public function error(string $field): ?string
    {
        return $this->errors[$field] ?? null;
    }

    /**
     * Lấy dữ liệu đã sanitize
     */
    public function validated(): array
    {
        $validated = [];
        foreach (array_keys($this->rules) as $field) {
            if (isset($this->data[$field])) {
                $validated[$field] = is_string($this->data[$field]) 
                    ? trim($this->data[$field]) 
                    : $this->data[$field];
            }
        }
        return $validated;
    }

    // ==================== VALIDATION RULES ====================

    private function ruleRequired(string $field, mixed $value, string $label, array $params): ?string
    {
        if ($value === null || $value === '' || $value === []) {
            return "{$label} không được để trống.";
        }
        return null;
    }

    private function ruleEmail(string $field, mixed $value, string $label, array $params): ?string
    {
        if ($value && !filter_var($value, FILTER_VALIDATE_EMAIL)) {
            return "{$label} không hợp lệ.";
        }
        return null;
    }

    private function ruleMin(string $field, mixed $value, string $label, array $params): ?string
    {
        $min = (int)$params[0];
        if ($value && mb_strlen($value) < $min) {
            return "{$label} phải có ít nhất {$min} ký tự.";
        }
        return null;
    }

    private function ruleMax(string $field, mixed $value, string $label, array $params): ?string
    {
        $max = (int)$params[0];
        if ($value && mb_strlen($value) > $max) {
            return "{$label} không được vượt quá {$max} ký tự.";
        }
        return null;
    }

    private function ruleNumeric(string $field, mixed $value, string $label, array $params): ?string
    {
        if ($value !== null && $value !== '' && !is_numeric($value)) {
            return "{$label} phải là số.";
        }
        return null;
    }

    private function ruleInteger(string $field, mixed $value, string $label, array $params): ?string
    {
        if ($value !== null && $value !== '' && filter_var($value, FILTER_VALIDATE_INT) === false) {
            return "{$label} phải là số nguyên.";
        }
        return null;
    }

    private function ruleMin_value(string $field, mixed $value, string $label, array $params): ?string
    {
        $min = (float)$params[0];
        if ($value !== null && $value !== '' && (float)$value < $min) {
            return "{$label} phải lớn hơn hoặc bằng {$min}.";
        }
        return null;
    }

    private function ruleMax_value(string $field, mixed $value, string $label, array $params): ?string
    {
        $max = (float)$params[0];
        if ($value !== null && $value !== '' && (float)$value > $max) {
            return "{$label} phải nhỏ hơn hoặc bằng {$max}.";
        }
        return null;
    }

    private function rulePhone(string $field, mixed $value, string $label, array $params): ?string
    {
        if ($value && !preg_match('/^(0|\+84)[0-9]{9,10}$/', $value)) {
            return "{$label} không hợp lệ (VD: 0901234567).";
        }
        return null;
    }

    private function ruleDate(string $field, mixed $value, string $label, array $params): ?string
    {
        if ($value && !strtotime($value)) {
            return "{$label} không phải ngày hợp lệ.";
        }
        return null;
    }

    private function ruleDatetime(string $field, mixed $value, string $label, array $params): ?string
    {
        if ($value) {
            $d = \DateTime::createFromFormat('Y-m-d H:i:s', $value) 
              ?? \DateTime::createFromFormat('Y-m-d\TH:i', $value)
              ?? \DateTime::createFromFormat('Y-m-d H:i', $value);
            if (!$d) {
                return "{$label} không đúng định dạng ngày giờ.";
            }
        }
        return null;
    }

    private function ruleConfirmed(string $field, mixed $value, string $label, array $params): ?string
    {
        $confirmField = $field . '_confirmation';
        $confirmValue = $this->data[$confirmField] ?? null;
        if ($value !== $confirmValue) {
            return "{$label} xác nhận không khớp.";
        }
        return null;
    }

    private function ruleAlpha_num(string $field, mixed $value, string $label, array $params): ?string
    {
        if ($value && !preg_match('/^[a-zA-Z0-9_]+$/', $value)) {
            return "{$label} chỉ chấp nhận chữ cái, số và dấu gạch dưới.";
        }
        return null;
    }

    private function ruleIn(string $field, mixed $value, string $label, array $params): ?string
    {
        if ($value && !in_array($value, $params)) {
            return "{$label} phải là một trong: " . implode(', ', $params) . ".";
        }
        return null;
    }

    private function ruleUrl(string $field, mixed $value, string $label, array $params): ?string
    {
        if ($value && !filter_var($value, FILTER_VALIDATE_URL)) {
            return "{$label} không phải URL hợp lệ.";
        }
        return null;
    }

    private function ruleAfter(string $field, mixed $value, string $label, array $params): ?string
    {
        $compareField = $params[0];
        $compareValue = $this->data[$compareField] ?? null;
        if ($value && $compareValue && strtotime($value) <= strtotime($compareValue)) {
            $compareLabel = $this->labels[$compareField] ?? $compareField;
            return "{$label} phải sau {$compareLabel}.";
        }
        return null;
    }

    private function ruleFuture(string $field, mixed $value, string $label, array $params): ?string
    {
        if ($value && strtotime($value) <= time()) {
            return "{$label} phải là thời gian trong tương lai.";
        }
        return null;
    }
}
