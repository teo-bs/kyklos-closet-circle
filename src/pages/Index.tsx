
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingBag, Sparkles, Recycle } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to <span className="text-[#715AFF]">Kýklos</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your circular closet marketplace where sustainability meets style. 
            Buy and sell pre-loved fashion from your campus community.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <ShoppingBag className="h-6 w-6 text-[#715AFF]" />
              </div>
              <CardTitle>Browse & Buy</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Discover unique fashion pieces from your campus community through our short-form video feed.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-[#715AFF]" />
              </div>
              <CardTitle>Sell & Shine</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Turn your closet into cash by filming 15-second videos of your pre-loved items.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <Recycle className="h-6 w-6 text-[#715AFF]" />
              </div>
              <CardTitle>Sustainable Style</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Join the circular fashion movement and make sustainable choices that matter.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="text-center space-y-4">
          <div className="space-x-4">
            <Link to="/feed">
              <Button size="lg" className="bg-[#715AFF] hover:bg-[#5a47cc]">
                Browse Items
              </Button>
            </Link>
            <Link to="/sell">
              <Button size="lg" variant="outline" className="border-[#715AFF] text-[#715AFF] hover:bg-[#715AFF] hover:text-white">
                Start Selling
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
