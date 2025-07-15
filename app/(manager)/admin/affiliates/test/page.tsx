"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/axios';

const TestAffiliatePage = () => {
    const [affiliates, setAffiliates] = useState<unknown[]>([]);
    const [loading, setLoading] = useState(false);

    const testGetAffiliates = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/affiliates');
            console.log('Affiliates response:', response.data);
            setAffiliates(response.data.affiliates || []);
        } catch (error) {
            console.error('Error fetching affiliates:', error);
        } finally {
            setLoading(false);
        }
    };

    const testGetCommissions = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/affiliates/commissions');
            console.log('Commissions response:', response.data);
        } catch (error) {
            console.error('Error fetching commissions:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        testGetAffiliates();
    }, []);

    return (
        <div className="space-y-6 p-6">
            <h1 className="text-2xl font-bold">Test Affiliate API</h1>

            <div className="flex space-x-4">
                <Button onClick={testGetAffiliates} disabled={loading}>
                    Test Get Affiliates
                </Button>
                <Button onClick={testGetCommissions} disabled={loading}>
                    Test Get Commissions
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Affiliates Data</CardTitle>
                </CardHeader>
                <CardContent>
                    <pre className="bg-gray-100 p-4 rounded overflow-auto">
                        {JSON.stringify(affiliates, null, 2)}
                    </pre>
                </CardContent>
            </Card>
        </div>
    );
};

export default TestAffiliatePage; 