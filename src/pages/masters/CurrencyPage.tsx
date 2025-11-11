import React from 'react';
import { MasterScreen } from '@/components/common/MasterScreen';

const CurrencyPage: React.FC = () => {
    const columns = [
        {
            key: 'id',
            label: 'ID',
            sortable: true,
            filterable: true,
            filterType: 'text'
        },
        {
            key: 'currencyCode',
            label: 'Currency Code',
            sortable: true,
            filterable: true,
            filterType: 'text'
        },
        {
            key: 'currencyName',
            label: 'Currency Name',
            sortable: true,
            filterable: true,
            filterType: 'text'
        },
        {
            key: 'currencySymbol',
            label: 'Symbol',
            sortable: true,
            filterable: true,
            filterType: 'text'
        },
        {
            key: 'isActive',
            label: 'Status',
            render: (row: any) => (row.isActive ?
                <span className='text-green-600 font-sm'>Active</span> :
                <span className='text-red-600 font-sm'>Inactive</span>
            ),
            sortable: true,
            filterable: true,
        }
    ];

    const formFields = [
        {
            name: 'currencyCode',
            label: 'Currency Code',
            type: 'text',
            placeholder: 'Enter currency code (e.g., USD)',
            required: true,
            validation: {
                minLength: 3,
                maxLength: 3,
                errorMessage: 'Currency code must be exactly 3 characters'
            }
        },
        {
            name: 'currencyName',
            label: 'Currency Name',
            type: 'text',
            placeholder: 'Enter currency name',
            required: true,
            validation: {
                minLength: 2,
                maxLength: 100,
                errorMessage: 'Currency name must be between 2 and 100 characters'
            }
        },
        {
            name: 'currencySymbol',
            label: 'Symbol',
            type: 'text',
            placeholder: 'Enter currency symbol (e.g., $)',
            required: false,
            validation: {
                maxLength: 10,
                errorMessage: 'Symbol must not exceed 10 characters'
            }
        },
        {
            name: 'isActive',
            label: 'Active Status',
            type: 'checkbox',
            required: false,
        }
    ];

    return (
        <MasterScreen
            title="Currency"
            endpoint="currency"
            columns={columns}
            formFields={formFields}
            searchPlaceholder="Search currencies by code, name..."
        />
    );
};

export default CurrencyPage;