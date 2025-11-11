import React from 'react';
import { MasterScreen } from '@/components/common/MasterScreen';

const CountryMasterPage: React.FC = () => {
    const columns = [
        {
            key: 'id',
            label: 'ID',
            sortable: true,
            filterable: true,
            filterType: 'text'
        },
        {
            key: 'countryName',
            label: 'Country Name',
            sortable: true,
            filterable: true,
            filterType: 'text'
        },
        {
            key: 'iso2Code',
            label: 'ISO2 Code',
            sortable: true,
            filterable: true,
            filterType: 'text'
        },
        {
            key: 'iso3Code',
            label: 'ISO3 Code',
            sortable: true,
            filterable: true,
            filterType: 'text'
        },
        {
            key: 'numericCode',
            label: 'Numeric Code',
            sortable: true,
            filterable: true,
            filterType: 'text'
        },
        {
            key: 'isActive',
            label: 'Status',
            render: (row: any) =>
                row.isActive ? (
                    <span className="text-green-600 font-sm">Active</span>
                ) : (
                    <span className="text-red-600 font-sm">Inactive</span>
                ),
            sortable: true,
            filterable: true
        }
    ];

    const formFields = [
        {
            name: 'countryName',
            label: 'Country Name',
            type: 'text',
            placeholder: 'Enter country name',
            required: true,
            validation: {
                minLength: 2,
                maxLength: 100,
                errorMessage: 'Country name must be between 2 and 100 characters'
            }
        },
        {
            name: 'iso2Code',
            label: 'ISO2 Code',
            type: 'text',
            placeholder: 'Enter ISO2 code (e.g., IN)',
            required: true,
            validation: {
                minLength: 2,
                maxLength: 2,
                // pattern: '^[A-Z]{2}$',
                errorMessage: 'ISO2 code must be exactly 2 uppercase letters'
            }
        },
        {
            name: 'iso3Code',
            label: 'ISO3 Code',
            type: 'text',
            placeholder: 'Enter ISO3 code (e.g., IND)',
            required: true,
            validation: {
                minLength: 3,
                maxLength: 3,
                // pattern: '^[A-Z]{3}$',
                errorMessage: 'ISO3 code must be exactly 3 uppercase letters'
            }
        },
        {
            name: 'numericCode',
            label: 'Numeric Code',
            type: 'text',
            placeholder: 'Enter numeric code (optional)',
            required: false,
            validation: {
                maxLength: 2,
                pattern: '^[0-9]{1,3}$',
                errorMessage: 'Numeric code must be up to 3 digits only'
            }
        },
        {
            name: 'isActive',
            label: 'Active Status',
            type: 'checkbox',
            required: false
        }
    ];

    return (
        <MasterScreen
            title="Country Master"
            endpoint="country"
            columns={columns}
            formFields={formFields}
            searchPlaceholder="Search by country name, ISO code, or numeric code..."
        />
    );
};

export default CountryMasterPage;
