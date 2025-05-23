"use client";

import { useState, useEffect, useCallback } from "react";
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Home, BrainCircuit, FolderOpen, Archive } from "lucide-react";
import FourQuadrantScatter from "./four-quad-scatter";


interface MatrixProps {
  chartData: ChartDataset[];
  meanAge: number;
}

interface ChartDataset {
  data: { x: number; y: number }[];
  label: string;
  backgroundColor: string;
}

export default function Matrix({ chartData, meanAge }: MatrixProps) {
  return (
    <div className="bg-background">
      <div className="flex justify-center items-center gap-4">
        <Link href="/go">
          <Button variant="outline"  className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            Home
          </Button>
        </Link>
      </div>
      <div className="container mx-auto px-4 py-8">
        <FourQuadrantScatter taskData={chartData} meanAge={meanAge} />
      </div>
    </div>
  );
}
